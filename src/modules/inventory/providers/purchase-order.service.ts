import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { PurchaseOrder, PurchaseOrderStatus } from "../../../../database/entities/purchase-order.entity"
import { PurchaseOrderItem } from "../../../../database/entities/purchase-order-item.entity"
import type { CreatePurchaseOrderDto } from "../dto/create-purchase-order.dto"

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private purchaseOrderItemRepository: Repository<PurchaseOrderItem>,
  ) { }

  async create(createPurchaseOrderDto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    const existingOrder = await this.purchaseOrderRepository.findOne({
      where: { orderNumber: createPurchaseOrderDto.orderNumber },
    })

    if (existingOrder) {
      throw new BadRequestException("Order number already exists")
    }

    // Calculate total amount
    const totalAmount = createPurchaseOrderDto.items.reduce((sum, item) => {
      return sum + item.quantityOrdered * item.unitPrice
    }, 0)

    const purchaseOrder = this.purchaseOrderRepository.create({
      ...createPurchaseOrderDto,
      orderDate: createPurchaseOrderDto.orderDate ? new Date(createPurchaseOrderDto.orderDate) : new Date(),
      expectedDeliveryDate: createPurchaseOrderDto.expectedDeliveryDate
        ? new Date(createPurchaseOrderDto.expectedDeliveryDate)
        : null,
      totalAmount,
    })

    const savedOrder = await this.purchaseOrderRepository.save(purchaseOrder)

    // Create order items
    const orderItems = createPurchaseOrderDto.items.map((item) =>
      this.purchaseOrderItemRepository.create({
        ...item,
        purchaseOrderId: savedOrder.id,
        totalPrice: item.quantityOrdered * item.unitPrice,
      }),
    )

    await this.purchaseOrderItemRepository.save(orderItems)

    return this.findOne(savedOrder.id)
  }

  async findAll(filters?: {
    status?: PurchaseOrderStatus
    supplierId?: string
  }): Promise<PurchaseOrder[]> {
    const query = this.purchaseOrderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.supplier", "supplier")
      .leftJoinAndSelect("order.items", "items")
      .leftJoinAndSelect("items.inventoryItem", "inventoryItem")

    if (filters?.status) {
      query.andWhere("order.status = :status", { status: filters.status })
    }

    if (filters?.supplierId) {
      query.andWhere("order.supplierId = :supplierId", { supplierId: filters.supplierId })
    }

    return query.orderBy("order.createdAt", "DESC").getMany()
  }

  async findOne(id: string): Promise<PurchaseOrder> {
    const order = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: ["supplier", "items", "items.inventoryItem"],
    })

    if (!order) {
      throw new NotFoundException("Purchase order not found")
    }

    return order
  }

  async updateStatus(id: string, status: PurchaseOrderStatus, approvedBy?: string): Promise<PurchaseOrder> {
    const order = await this.findOne(id)
    order.status = status

    if (status === PurchaseOrderStatus.APPROVED && approvedBy) {
      order.approvedBy = approvedBy
    }

    if (status === PurchaseOrderStatus.ORDERED && !order.orderDate) {
      order.orderDate = new Date()
    }

    return this.purchaseOrderRepository.save(order)
  }

  async receiveItems(
    orderId: string,
    receivedItems: Array<{
      itemId: string
      quantityReceived: number
    }>,
  ): Promise<PurchaseOrder> {
    const order = await this.findOne(orderId)

    if (order.status !== PurchaseOrderStatus.ORDERED) {
      throw new BadRequestException("Order must be in ORDERED status to receive items")
    }

    for (const receivedItem of receivedItems) {
      const orderItem = order.items.find((item) => item.id === receivedItem.itemId)
      if (!orderItem) {
        throw new NotFoundException(`Order item ${receivedItem.itemId} not found`)
      }

      const newQuantityReceived = orderItem.quantityReceived + receivedItem.quantityReceived
      if (newQuantityReceived > orderItem.quantityOrdered) {
        throw new BadRequestException(
          `Cannot receive more than ordered quantity for item ${orderItem.inventoryItem.name}`,
        )
      }

      orderItem.quantityReceived = newQuantityReceived
      await this.purchaseOrderItemRepository.save(orderItem)
    }

    // Update order status
    const allItemsReceived = order.items.every((item) => item.quantityReceived === item.quantityOrdered)

    const someItemsReceived = order.items.some((item) => item.quantityReceived > 0)

    if (allItemsReceived) {
      order.status = PurchaseOrderStatus.RECEIVED
      order.actualDeliveryDate = new Date()
    } else if (someItemsReceived) {
      order.status = PurchaseOrderStatus.PARTIALLY_RECEIVED
    }

    return this.purchaseOrderRepository.save(order)
  }

  async generateReorderSuggestions(): Promise<
    Array<{
      inventoryItem: any
      suggestedQuantity: number
      preferredSupplier: any
    }>
  > {
    // This would typically involve more complex logic based on:
    // - Historical sales data
    // - Lead times
    // - Seasonal patterns
    // - Current stock levels

    const lowStockQuery = `
      SELECT 
        i.*,
        s.*,
        (i.reorderQuantity) as suggestedQuantity
      FROM inventory_items i
      LEFT JOIN suppliers s ON i.supplierId = s.id
      WHERE i.currentStock <= i.reorderPoint
        AND i.status = 'active'
        AND s.isActive = true
      ORDER BY (i.reorderPoint - i.currentStock) DESC
    `

    const results = await this.purchaseOrderRepository.query(lowStockQuery)

    return results.map((result) => ({
      inventoryItem: {
        id: result.id,
        sku: result.sku,
        name: result.name,
        currentStock: result.currentStock,
        reorderPoint: result.reorderPoint,
      },
      suggestedQuantity: result.suggestedQuantity,
      preferredSupplier: {
        id: result.supplierId,
        name: result.supplier_name,
        email: result.supplier_email,
      },
    }))
  }
}
