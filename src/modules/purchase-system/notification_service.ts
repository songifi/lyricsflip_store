// src/services/notification.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Purchase } from '../entities/purchase.entity';
import { DigitalDownload } from '../entities/digital-download.entity';
import { ItemType } from '../entities/purchase-item.entity';

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface NotificationData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private configService: ConfigService) {}

  async sendPurchaseConfirmation(purchase: Purchase): Promise<void> {
    try {
      const template = this.generatePurchaseConfirmationTemplate(purchase);
      
      await this.sendEmail({
        to: purchase.buyer.email,
        subject: template.subject,
        template: 'purchase-confirmation',
        data: {
          purchase,
          downloadLinks: await this.getDownloadLinks(purchase),
        },
      });

      // Send push notification if user has enabled them
      await this.sendPushNotification(purchase.buyerId, {
        title: 'Purchase Confirmed',
        body: `Your order ${purchase.orderNumber} has been confirmed!`,
        data: { purchaseId: purchase.id },
      });

      this.logger.log(`Purchase confirmation sent for order: ${purchase.orderNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send purchase confirmation: ${error.message}`, error.stack);
    }
  }

  async sendGiftNotification(purchase: Purchase): Promise<void> {
    if (!purchase.isGift || !purchase.recipient) {
      return;
    }

    try {
      const template = this.generateGiftNotificationTemplate(purchase);
      
      await this.sendEmail({
        to: purchase.recipient.email,
        subject: template.subject,
        template: 'gift-notification',
        data: {
          purchase,
          giftMessage: purchase.giftMessage,
          senderName: purchase.buyer.firstName + ' ' + purchase.buyer.lastName,
          downloadLinks: await this.getDownloadLinks(purchase),
        },
      });

      await this.sendPushNotification(purchase.recipientId, {
        title: 'You\'ve Received a Gift!',
        body: `${purchase.buyer.firstName} sent you a music gift`,
        data: { purchaseId: purchase.id, isGift: true },
      });

      this.logger.log(`Gift notification sent for order: ${purchase.orderNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send gift notification: ${error.message}`, error.stack);
    }
  }

  async sendRefundConfirmation(purchase: Purchase): Promise<void> {
    try {
      const template = this.generateRefundConfirmationTemplate(purchase);
      
      await this.sendEmail({
        to: purchase.buyer.email,
        subject: template.subject,
        template: 'refund-confirmation',
        data: { purchase },
      });

      await this.sendPushNotification(purchase.buyerId, {
        title: 'Refund Processed',
        body: `Your refund for order ${purchase.orderNumber} has been processed`,
        data: { purchaseId: purchase.id },
      });

      this.logger.log(`Refund confirmation sent for order: ${purchase.orderNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send refund confirmation: ${error.message}`, error.stack);
    }
  }

  async sendCancellationNotification(purchase: Purchase): Promise<void> {
    try {
      const template = this.generateCancellationTemplate(