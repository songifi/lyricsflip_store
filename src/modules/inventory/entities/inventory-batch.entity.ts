import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { InventoryItem } from "./inventory-item.entity"

export enum BatchStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  RECALLED = "recalled",
  SOLD_OUT = "sold_out",
}

@Entity("inventory_batches")
export class InventoryBatch {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 100, unique: true })
  batchNumber: string

  @Column({ length: 100, nullable: true })
  lotNumber: string

  @Column()
  inventoryItemId: string

  @ManyToOne(
    () => InventoryItem,
    (item) => item.batches,
  )
  @JoinColumn({ name: "inventoryItemId" })
  inventoryItem: InventoryItem

  @Column({ type: "int" })
  quantity: number

  @Column({ type: "int", default: 0 })
  reservedQuantity: number

  @Column({ type: "int", default: 0 })
  soldQuantity: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  costPrice: number

  @Column({ type: "date", nullable: true })
  manufacturingDate: Date

  @Column({ type: "date", nullable: true })
  expiryDate: Date

  @Column({ type: "date" })
  receivedDate: Date

  @Column({ type: "enum", enum: BatchStatus, default: BatchStatus.ACTIVE })
  status: BatchStatus

  @Column({ type: "text", nullable: true })
  notes: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Computed property
  get availableQuantity(): number {
    return this.quantity - this.reservedQuantity - this.soldQuantity
  }
}
