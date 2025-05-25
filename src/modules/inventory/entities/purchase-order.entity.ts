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
import { PurchaseOrderItem } from "./purchase-order-item.entity"

export enum PurchaseOrderStatus {
  DRAFT = "draft",
  PENDING = "pending",
  APPROVED = "approved",
  ORDERED = "ordered",
  PARTIALLY_RECEIVED = "partially_received",
  RECEIVED = "received",
  CANCELLED = "cancelled",
}

@Entity("purchase_orders")
export class PurchaseOrder {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 100, unique: true })
  orderNumber: string

  @Column()
  supplierId: string

  @ManyToOne(
    () => Supplier,
    (supplier) => supplier.purchaseOrders,
  )
  @JoinColumn({ name: "supplierId" })
  supplier: Supplier

  @Column({ type: "enum", enum: PurchaseOrderStatus, default: PurchaseOrderStatus.DRAFT })
  status: PurchaseOrderStatus

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  totalAmount: number

  @Column({ type: "date", nullable: true })
  orderDate: Date

  @Column({ type: "date", nullable: true })
  expectedDeliveryDate: Date

  @Column({ type: "date", nullable: true })
  actualDeliveryDate: Date

  @Column({ length: 100 })
  createdBy: string

  @Column({ length: 100, nullable: true })
  approvedBy: string

  @Column({ type: "text", nullable: true })
  notes: string

  @OneToMany(
    () => PurchaseOrderItem,
    (item) => item.purchaseOrder,
    { cascade: true },
  )
  items: PurchaseOrderItem[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
