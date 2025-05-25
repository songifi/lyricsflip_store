import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { type Repository, LessThan } from "typeorm"
import { InventoryBatch, BatchStatus } from "../../../../database/entities/inventory-batch.entity"
import type { CreateBatchDto } from "../dto/create-batch.dto"
import type { InventoryService } from "./inventory.service"
import { AuditType } from "../../../../database/entities/inventory-audit.entity"

@Injectable()
export class BatchService {
  constructor(
    private batchRepository: Repository<InventoryBatch>,
    private inventoryService: InventoryService,
    @InjectRepository(InventoryBatch)
  ) {}

  async create(createBatchDto: CreateBatchDto): Promise<InventoryBatch> {
    const existingBatch = await this.batchRepository.findOne({
      where: { batchNumber: createBatchDto.batchNumber },
    })

    if (existingBatch) {
      throw new BadRequestException("Batch number already exists")
    }

    const batch = this.batchRepository.create({
      ...createBatchDto,
      manufacturingDate: createBatchDto.manufacturingDate ? new Date(createBatchDto.manufacturingDate) : null,
      expiryDate: createBatchDto.expiryDate ? new Date(createBatchDto.expiryDate) : null,
      receivedDate: new Date(createBatchDto.receivedDate),
    })

    const savedBatch = await this.batchRepository.save(batch)

    // Update inventory stock
    await this.inventoryService.adjustStock({
      inventoryItemId: createBatchDto.inventoryItemId,
      quantityChanged: createBatchDto.quantity,
      type: AuditType.STOCK_IN,
      reason: `Batch received: ${createBatchDto.batchNumber}`,
      reference: savedBatch.id,
      performedBy: "system",
    })

    return savedBatch
  }

  async findAll(filters?: {
    inventoryItemId?: string
    status?: BatchStatus
    expiringSoon?: boolean
  }): Promise<InventoryBatch[]> {
    const query = this.batchRepository.createQueryBuilder("batch").leftJoinAndSelect("batch.inventoryItem", "item")

    if (filters?.inventoryItemId) {
      query.andWhere("batch.inventoryItemId = :inventoryItemId", {
        inventoryItemId: filters.inventoryItemId,
      })
    }

    if (filters?.status) {
      query.andWhere("batch.status = :status", { status: filters.status })
    }

    if (filters?.expiringSoon) {
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      query.andWhere("batch.expiryDate <= :expiryDate", { expiryDate: thirtyDaysFromNow })
    }

    return query.orderBy("batch.expiryDate", "ASC").getMany()
  }

  async findOne(id: string): Promise<InventoryBatch> {
    const batch = await this.batchRepository.findOne({
      where: { id },
      relations: ["inventoryItem"],
    })

    if (!batch) {
      throw new NotFoundException("Batch not found")
    }

    return batch
  }

  async updateBatchStatus(id: string, status: BatchStatus, reason?: string): Promise<InventoryBatch> {
    const batch = await this.findOne(id)
    const oldStatus = batch.status
    batch.status = status

    // If marking as expired or recalled, remove from available stock
    if ((status === BatchStatus.EXPIRED || status === BatchStatus.RECALLED) && oldStatus === BatchStatus.ACTIVE) {
      const availableQuantity = batch.availableQuantity
      if (availableQuantity > 0) {
        await this.inventoryService.adjustStock({
          inventoryItemId: batch.inventoryItemId,
          quantityChanged: -availableQuantity,
          type: status === BatchStatus.EXPIRED ? AuditType.DAMAGE : AuditType.ADJUSTMENT,
          reason: reason || `Batch ${status}: ${batch.batchNumber}`,
          reference: batch.id,
          performedBy: "system",
        })
      }
    }

    return this.batchRepository.save(batch)
  }

  async getExpiringBatches(days = 30): Promise<InventoryBatch[]> {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + days)

    return this.batchRepository.find({
      where: {
        expiryDate: LessThan(expiryDate),
        status: BatchStatus.ACTIVE,
      },
      relations: ["inventoryItem"],
      order: { expiryDate: "ASC" },
    })
  }

  async allocateStock(inventoryItemId: string, quantity: number): Promise<InventoryBatch[]> {
    const availableBatches = await this.batchRepository.find({
      where: {
        inventoryItemId,
        status: BatchStatus.ACTIVE,
      },
      order: { expiryDate: "ASC" }, // FIFO allocation
    })

    const allocatedBatches: InventoryBatch[] = []
    let remainingQuantity = quantity

    for (const batch of availableBatches) {
      if (remainingQuantity <= 0) break

      const availableInBatch = batch.availableQuantity
      if (availableInBatch > 0) {
        const allocateFromBatch = Math.min(remainingQuantity, availableInBatch)
        batch.reservedQuantity += allocateFromBatch
        remainingQuantity -= allocateFromBatch

        await this.batchRepository.save(batch)
        allocatedBatches.push(batch)
      }
    }

    if (remainingQuantity > 0) {
      throw new BadRequestException(`Insufficient stock. Missing ${remainingQuantity} units`)
    }

    return allocatedBatches
  }

  async confirmAllocation(batchId: string, quantity: number): Promise<InventoryBatch> {
    const batch = await this.findOne(batchId)

    if (batch.reservedQuantity < quantity) {
      throw new BadRequestException("Cannot confirm more than reserved quantity")
    }

    batch.reservedQuantity -= quantity
    batch.soldQuantity += quantity

    if (batch.availableQuantity === 0) {
      batch.status = BatchStatus.SOLD_OUT
    }

    return this.batchRepository.save(batch)
  }
}
