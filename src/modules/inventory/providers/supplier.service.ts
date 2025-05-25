import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Supplier } from "../../../../database/entities/supplier.entity"
import type { CreateSupplierDto } from "../dto/create-supplier.dto"

@Injectable()
export class SupplierService {
  private supplierRepository: Repository<Supplier>

  constructor(
    @InjectRepository(Supplier)
    supplierRepository: Repository<Supplier>,
  ) {
    this.supplierRepository = supplierRepository;
  }

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    const existingSupplier = await this.supplierRepository.findOne({
      where: { email: createSupplierDto.email },
    })

    if (existingSupplier) {
      throw new BadRequestException("Supplier with this email already exists")
    }

    const supplier = this.supplierRepository.create(createSupplierDto)
    return this.supplierRepository.save(supplier)
  }

  async findAll(activeOnly = false): Promise<Supplier[]> {
    const query = this.supplierRepository
      .createQueryBuilder("supplier")
      .leftJoinAndSelect("supplier.inventoryItems", "items")

    if (activeOnly) {
      query.where("supplier.isActive = :isActive", { isActive: true })
    }

    return query.getMany()
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
      relations: ["inventoryItems", "purchaseOrders"],
    })

    if (!supplier) {
      throw new NotFoundException("Supplier not found")
    }

    return supplier
  }

  async update(id: string, updateSupplierDto: Partial<CreateSupplierDto>): Promise<Supplier> {
    const supplier = await this.findOne(id)
    Object.assign(supplier, updateSupplierDto)
    return this.supplierRepository.save(supplier)
  }

  async remove(id: string): Promise<void> {
    const supplier = await this.findOne(id)

    // Check if supplier has active inventory items
    const activeItems = await this.supplierRepository
      .createQueryBuilder("supplier")
      .leftJoin("supplier.inventoryItems", "items")
      .where("supplier.id = :id", { id })
      .andWhere("items.status = :status", { status: "active" })
      .getCount()

    if (activeItems > 0) {
      throw new BadRequestException("Cannot delete supplier with active inventory items")
    }

    await this.supplierRepository.remove(supplier)
  }

  async getSupplierPerformance(id: string): Promise<{
    totalOrders: number
    onTimeDeliveries: number
    averageDeliveryTime: number
    totalValue: number
  }> {
    const supplier = await this.supplierRepository
      .createQueryBuilder("supplier")
      .leftJoinAndSelect("supplier.purchaseOrders", "orders")
      .where("supplier.id = :id", { id })
      .getOne()

    if (!supplier) {
      throw new NotFoundException("Supplier not found")
    }

    const orders = supplier.purchaseOrders || []
    const completedOrders = orders.filter((order) => order.status === "received" && order.actualDeliveryDate)

    const onTimeDeliveries = completedOrders.filter(
      (order) => order.actualDeliveryDate <= order.expectedDeliveryDate,
    ).length

    const totalDeliveryTime = completedOrders.reduce((sum, order) => {
      const deliveryTime = order.actualDeliveryDate.getTime() - order.orderDate.getTime()
      return sum + deliveryTime
    }, 0)

    const averageDeliveryTime =
      completedOrders.length > 0
        ? totalDeliveryTime / completedOrders.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0

    const totalValue = orders.reduce((sum, order) => sum + order.totalAmount, 0)

    return {
      totalOrders: orders.length,
      onTimeDeliveries,
      averageDeliveryTime,
      totalValue,
    }
  }
}
