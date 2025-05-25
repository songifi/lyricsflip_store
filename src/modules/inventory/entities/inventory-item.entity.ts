import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm"
import { Supplier } from "./supplier.entity"
import { InventoryBatch } from "./inventory-batch.entity"
import { InventoryAudit } from "./inventory-audit.entity"

export enum InventoryStatus {
  ACTIVE = "active",
  DISCONTINUED = "discontinued",
  OUT_OF_STOCK = "out_of_stock",
}

@Entity("inventory_items")
export class InventoryItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 100, unique: true })
  sku: string

  @Column({ length: 255 })
  name: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ length: 100 })
  category: string

  @Column({ type: "decimal", precision: 10, scale: 2 })
  unitPrice: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  costPrice: number

  @Column({ type: "int", default: 0 })
  currentStock: number

  @Column({ type: "int", default: 10 })
  minimumStock: number

  @Column({ type: "int", default: 100 })
  maximumStock: number

  @Column({ type: "int", default: 50 })
  reorderPoint: number

  @Column({ type: "int", default: 100 })
  reorderQuantity: number

  @Column({ length: 50, nullable: true })
  unit: string // pieces, kg, liters, etc.

  @Column({ type: "enum", enum: InventoryStatus, default: InventoryStatus.ACTIVE })
  status: InventoryStatus

  @Column({ nullable: true })
  supplierId: string

  @ManyToOne(
    () => Supplier,
    (supplier) => supplier.inventoryItems,
  )
  @JoinColumn({ name: "supplierId" })
  supplier: Supplier

  @OneToMany(
    () => InventoryBatch,
    (batch) => batch.inventoryItem,
  )
  batches: InventoryBatch[]

  @OneToMany(
    () => InventoryAudit,
    (audit) => audit.inventoryItem,
  )
  audits: InventoryAudit[]

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
