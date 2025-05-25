import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { InventoryItem } from "./inventory-item.entity"

export enum AuditType {
  STOCK_IN = "stock_in",
  STOCK_OUT = "stock_out",
  ADJUSTMENT = "adjustment",
  TRANSFER = "transfer",
  DAMAGE = "damage",
  RETURN = "return",
}

@Entity("inventory_audits")
export class InventoryAudit {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  inventoryItemId: string

  @ManyToOne(
    () => InventoryItem,
    (item) => item.audits,
  )
  @JoinColumn({ name: "inventoryItemId" })
  inventoryItem: InventoryItem

  @Column({ type: "enum", enum: AuditType })
  type: AuditType

  @Column({ type: "int" })
  quantityBefore: number

  @Column({ type: "int" })
  quantityChanged: number

  @Column({ type: "int" })
  quantityAfter: number

  @Column({ length: 255, nullable: true })
  reason: string

  @Column({ length: 255, nullable: true })
  reference: string // Order ID, Transfer ID, etc.

  @Column({ length: 100 })
  performedBy: string // User ID or system

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>

  @CreateDateColumn()
  createdAt: Date
}
