import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { InventoryItem, InventoryStatus } from "../../../../database/entities/inventory-item.entity"
import { type InventoryAudit, AuditType } from "../../../../database/entities/inventory-audit.entity"
import type { CreateInventoryItemDto } from "../dto/create-inventory-item.dto"
import type { UpdateInventoryItemDto } from "../dto/update-inventory-item.dto"
import type { StockAdjustmentDto } from "../dto/stock-adjustment.dto"

@Injectable()
export class InventoryService {
  constructor(
    private inventoryRepository: Repository<InventoryItem>,
    private auditRepository: Repository<InventoryAudit>,
    @InjectRepository(InventoryItem)
  ) {}

  async create(createInventoryItemDto: CreateInventoryItemDto): Promise<InventoryItem> {
    const existingItem = await this.inventoryRepository.findOne({
      where: { sku: createInventoryItemDto.sku },
    })

    if (existingItem) {
      throw new BadRequestException("SKU already exists")
    }

    const inventoryItem = this.inventoryRepository.create(createInventoryItemDto)
    const savedItem = await this.inventoryRepository.save(inventoryItem)

    // Create initial audit record
    await this.createAuditRecord({
      inventoryItemId: savedItem.id,
      type: AuditType.STOCK_IN,
      quantityBefore: 0,
      quantityChanged: savedItem.currentStock,
      quantityAfter: savedItem.currentStock,
      reason: "Initial stock",
      performedBy: "system",
    })

    return savedItem
  }

  async findAll(filters?: {
    category?: string
    status?: InventoryStatus
    lowStock?: boolean
  }): Promise<InventoryItem[]> {
    const query = this.inventoryRepository.createQueryBuilder("item").leftJoinAndSelect("item.supplier", "supplier")

    if (filters?.category) {
      query.andWhere("item.category = :category", { category: filters.category })
    }

    if (filters?.status) {
      query.andWhere("item.status = :status", { status: filters.status })
    }

    if (filters?.lowStock) {
      query.andWhere("item.currentStock <= item.reorderPoint")
    }

    return query.getMany()
  }

  async findOne(id: string): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findOne({
      where: { id },
      relations: ["supplier", "batches", "audits"],
    })

    if (!item) {
      throw new NotFoundException("Inventory item not found")
    }

    return item
  }

  async update(id: string, updateInventoryItemDto: UpdateInventoryItemDto): Promise<InventoryItem> {
    const item = await this.findOne(id)
    Object.assign(item, updateInventoryItemDto)
    return this.inventoryRepository.save(item)
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id)
    await this.inventoryRepository.remove(item)
  }

  async adjustStock(adjustmentDto: StockAdjustmentDto): Promise<InventoryItem> {
    const item = await this.findOne(adjustmentDto.inventoryItemId)
    const quantityBefore = item.currentStock
    const quantityAfter = quantityBefore + adjustmentDto.quantityChanged

    if (quantityAfter < 0) {
      throw new BadRequestException("Insufficient stock for adjustment")
    }

    item.currentStock = quantityAfter

    // Update status based on stock level
    if (quantityAfter === 0) {
      item.status = InventoryStatus.OUT_OF_STOCK
    } else if (item.status === InventoryStatus.OUT_OF_STOCK && quantityAfter > 0) {
      item.status = InventoryStatus.ACTIVE
    }

    const updatedItem = await this.inventoryRepository.save(item)

    // Create audit record
    await this.createAuditRecord({
      inventoryItemId: item.id,
      type: adjustmentDto.type,
      quantityBefore,
      quantityChanged: adjustmentDto.quantityChanged,
      quantityAfter,
      reason: adjustmentDto.reason,
      reference: adjustmentDto.reference,
      performedBy: adjustmentDto.performedBy,
      metadata: adjustmentDto.metadata,
    })

    return updatedItem
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return this.inventoryRepository
      .createQueryBuilder("item")
      .where("item.currentStock <= item.reorderPoint")
      .andWhere("item.status = :status", { status: InventoryStatus.ACTIVE })
      .leftJoinAndSelect("item.supplier", "supplier")
      .getMany()
  }

  async getStockValue(): Promise<{ totalValue: number; itemCount: number }> {
    const result = await this.inventoryRepository
      .createQueryBuilder("item")
      .select("SUM(item.currentStock * item.costPrice)", "totalValue")
      .addSelect("COUNT(*)", "itemCount")
      .where("item.status = :status", { status: InventoryStatus.ACTIVE })
      .getRawOne()

    return {
      totalValue: Number.parseFloat(result.totalValue) || 0,
      itemCount: Number.parseInt(result.itemCount) || 0,
    }
  }

  async getInventoryTurnover(itemId: string, days = 30): Promise<number> {
    const item = await this.findOne(itemId)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const soldQuantity = await this.auditRepository
      .createQueryBuilder("audit")
      .select("SUM(ABS(audit.quantityChanged))", "totalSold")
      .where("audit.inventoryItemId = :itemId", { itemId })
      .andWhere("audit.type = :type", { type: AuditType.STOCK_OUT })
      .andWhere("audit.createdAt >= :startDate", { startDate })
      .getRawOne()

    const avgInventory = (item.currentStock + item.maximumStock) / 2
    const totalSold = Number.parseFloat(soldQuantity.totalSold) || 0

    return avgInventory > 0 ? totalSold / avgInventory : 0
  }

  private async createAuditRecord(auditData: Partial<InventoryAudit>): Promise<InventoryAudit> {
    const audit = this.auditRepository.create(auditData)
    return this.auditRepository.save(audit)
  }
}
