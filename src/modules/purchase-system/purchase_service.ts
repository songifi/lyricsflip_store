// src/services/purchase.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { Purchase, PurchaseStatus } from '../entities/purchase.entity';
import { PurchaseItem, ItemType, ItemStatus } from '../entities/purchase-item.entity';
import { DigitalDownload } from '../entities/digital-download.entity';
import { Receipt, ReceiptType } from '../entities/receipt.entity';
import { CreatePurchaseDto } from '../dto/create-purchase.dto';
import { UpdatePurchaseDto } from '../dto/update-purchase.dto';
import { DigitalDownloadService } from './digital-download.service';
import { NotificationService } from './notification.service';
import { AnalyticsService } from './analytics.service';
import { PaymentService } from './payment.service';
import * as crypto from 'crypto';

@Injectable()
export class PurchaseService {
  private readonly logger = new Logger(PurchaseService.name);

  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(PurchaseItem)
    private purchaseItemRepository: Repository<PurchaseItem>,
    @InjectRepository(Receipt)
    private receiptRepository: Repository<Receipt>,
    private dataSource: DataSource,
    private digitalDownloadService: DigitalDownloadService,
    private notificationService: NotificationService,
    private analyticsService: AnalyticsService,
    private paymentService: PaymentService,
  ) {}

  async createPurchase(createPurchaseDto: CreatePurchaseDto): Promise<Purchase> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate unique order number
      const orderNumber = this.generateOrderNumber();

      // Calculate totals
      const { subtotal, tax, total } = this.calculateTotals(createPurchaseDto);

      // Create purchase
      const purchase = queryRunner.manager.create(Purchase, {
        ...createPurchaseDto,
        orderNumber,
        subtotal,
        tax,
        total,
        status: PurchaseStatus.PENDING,
      });

      const savedPurchase = await queryRunner.manager.save(purchase);

      // Create purchase items
      const items = await Promise.all(
        createPurchaseDto.items.map(async (itemDto) => {
          const item = queryRunner.manager.create(PurchaseItem, {
            ...itemDto,
            purchaseId: savedPurchase.id,
            totalPrice: itemDto.unitPrice * itemDto.quantity,
          });
          return queryRunner.manager.save(item);
        }),
      );

      savedPurchase.items = items;

      // Process payment
      const paymentResult = await this.paymentService.processPayment({
        amount: total,
        currency: createPurchaseDto.currency || 'USD',
        paymentMethod: createPurchaseDto.paymentMethod,
        orderId: savedPurchase.id,
      });

      if (!paymentResult.success) {
        throw new BadRequestException('Payment processing failed');
      }

      // Update purchase with payment details
      savedPurchase.paymentIntentId = paymentResult.paymentIntentId;
      savedPurchase.transactionId = paymentResult.transactionId;
      savedPurchase.status = PurchaseStatus.COMPLETED;
      savedPurchase.completedAt = new Date();

      await queryRunner.manager.save(savedPurchase);

      // Process digital downloads
      await this.processDigitalDownloads(savedPurchase, queryRunner);

      // Generate receipt
      await this.generateReceipt(savedPurchase, queryRunner);

      // Record analytics
      await this.analyticsService.recordPurchase(savedPurchase);

      // Send notifications
      await this.notificationService.sendPurchaseConfirmation(savedPurchase);

      await queryRunner.commitTransaction();

      this.logger.log(`Purchase created successfully: ${savedPurchase.orderNumber}`);

      return this.findById(savedPurchase.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create purchase: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findById(id: string): Promise<Purchase> {
    const purchase = await this.purchaseRepository.findOne({
      where: { id },
      relations: [
        'buyer',
        'recipient',
        'items',
        'items.digitalDownloads',
        'receipts',
      ],
    });

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    return purchase;
  }

  async findByOrderNumber(orderNumber: string): Promise<Purchase> {
    const purchase = await this.purchaseRepository.findOne({
      where: { orderNumber },
      relations: [
        'buyer',
        'recipient',
        'items',
        'items.digitalDownloads',
        'receipts',
      ],
    });

    if (!purchase) {
      throw new NotFoundException(`Purchase with order number ${orderNumber} not found`);
    }

    return purchase;
  }

  async findUserPurchases(userId: string, page = 1, limit = 10): Promise<{
    purchases: Purchase[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const [purchases, total] = await this.purchaseRepository.findAndCount({
      where: [
        { buyerId: userId },
        { recipientId: userId },
      ],
      relations: ['items', 'receipts'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      purchases,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updatePurchase(
    id: string,
    updatePurchaseDto: UpdatePurchaseDto,
  ): Promise<Purchase> {
    const purchase = await this.findById(id);

    Object.assign(purchase, updatePurchaseDto);

    if (updatePurchaseDto.status) {
      await this.handleStatusChange(purchase, updatePurchaseDto.status);
    }

    return this.purchaseRepository.save(purchase);
  }

  async refundPurchase(id: string, reason?: string): Promise<Purchase> {
    const purchase = await this.findById(id);

    if (purchase.status !== PurchaseStatus.COMPLETED) {
      throw new BadRequestException('Only completed purchases can be refunded');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Process refund through payment service
      const refundResult = await this.paymentService.processRefund({
        transactionId: purchase.transactionId,
        amount: purchase.total,
        reason,
      });

      if (!refundResult.success) {
        throw new BadRequestException('Refund processing failed');
      }

      // Update purchase status
      purchase.status = PurchaseStatus.REFUNDED;
      purchase.refundedAt = new Date();

      await queryRunner.manager.save(purchase);

      // Disable digital downloads
      await this.digitalDownloadService.disableDownloadsForPurchase(purchase.id);

      // Generate refund receipt
      await this.generateRefundReceipt(purchase, queryRunner);

      // Send notification
      await this.notificationService.sendRefundConfirmation(purchase);

      await queryRunner.commitTransaction();

      return purchase;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async processGiftPurchase(purchaseId: string): Promise<void> {
    const purchase = await this.findById(purchaseId);

    if (!purchase.isGift || !purchase.recipientId) {
      throw new BadRequestException('Invalid gift purchase');
    }

    // Send gift notification to recipient
    await this.notificationService.sendGiftNotification(purchase);

    // Process digital downloads for recipient
    await this.digitalDownloadService.transferDownloadsToRecipient(
      purchaseId,
      purchase.recipientId,
    );
  }

  private async processDigitalDownloads(
    purchase: Purchase,
    queryRunner: QueryRunner,
  ): Promise<void> {
    const digitalItems = purchase.items.filter(
      item => item.itemType === ItemType.MUSIC_DOWNLOAD ||
              item.itemType === ItemType.ALBUM ||
              item.itemType === ItemType.SINGLE,
    );

    for (const item of digitalItems) {
      await this.digitalDownloadService.createDownload(
        item,
        purchase.isGift ? purchase.recipientId : purchase.buyerId,
        queryRunner,
      );

      item.status = ItemStatus.READY;
      await queryRunner.manager.save(item);
    }
  }

  private async generateReceipt(
    purchase: Purchase,
    queryRunner: QueryRunner,
  ): Promise<Receipt> {
    const receiptNumber = this.generateReceiptNumber();

    const itemDetails = purchase.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      itemType: item.itemType,
    }));

    const receipt = queryRunner.manager.create(Receipt, {
      purchaseId: purchase.id,
      userId: purchase.buyerId,
      receiptNumber,
      type: purchase.isGift ? ReceiptType.GIFT : ReceiptType.PURCHASE,
      amount: purchase.total,
      currency: purchase.currency,
      itemDetails,
    });

    return queryRunner.manager.save(receipt);
  }

  private async generateRefundReceipt(
    purchase: Purchase,
    queryRunner: QueryRunner,
  ): Promise<Receipt> {
    const receiptNumber = this.generateReceiptNumber();

    const receipt = queryRunner.manager.create(Receipt, {
      purchaseId: purchase.id,
      userId: purchase.buyerId,
      receiptNumber,
      type: ReceiptType.REFUND,
      amount: -purchase.total, // Negative amount for refund
      currency: purchase.currency,
      itemDetails: purchase.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        itemType: item.itemType,
      })),
    });

    return queryRunner.manager.save(receipt);
  }

  private async handleStatusChange(
    purchase: Purchase,
    newStatus: PurchaseStatus,
  ): Promise<void> {
    switch (newStatus) {
      case PurchaseStatus.COMPLETED:
        purchase.completedAt = new Date();
        await this.notificationService.sendPurchaseConfirmation(purchase);
        break;
      case PurchaseStatus.REFUNDED:
        purchase.refundedAt = new Date();
        await this.notificationService.sendRefundConfirmation(purchase);
        break;
      case PurchaseStatus.CANCELLED:
        await this.notificationService.sendCancellationNotification(purchase);
        break;
    }
  }

  private calculateTotals(createPurchaseDto: CreatePurchaseDto): {
    subtotal: number;
    tax: number;
    total: number;
  } {
    const subtotal = createPurchaseDto.items.reduce(
      (sum, item) => sum + (item.unitPrice * item.quantity),
      0,
    );

    const tax = subtotal * (createPurchaseDto.taxRate || 0);
    const shipping = createPurchaseDto.shipping || 0;
    const discount = createPurchaseDto.discount || 0;

    const total = subtotal + tax + shipping - discount;

    return { subtotal, tax, total };
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  private generateReceiptNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `REC-${timestamp}-${random}`;
  }
}