import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { InventoryItem } from "./inventory-item.entity"
import { PurchaseOrder } from "./purchase-order.entity"

@Entity("suppliers")
export class Supplier {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  name: string

  @Column({ length: 255, unique: true })
  email: string

  @Column({ length: 20, nullable: true })
  phone: string

  @Column({ type: "text", nullable: true })
  address: string

  @Column({ length: 100, nullable: true })
  contactPerson: string

  @Column({ type: "decimal", precision: 3, scale: 2, default: 0 })
  rating: number

  @Column({ type: "text", nullable: true })
  notes: string

  @Column({ default: true })
  isActive: boolean

  @OneToMany(
    () => InventoryItem,
    (item) => item.supplier,
  )
  inventoryItems: InventoryItem[]

  @OneToMany(
    () => PurchaseOrder,
    (order) => order.supplier,
  )
  purchaseOrders: PurchaseOrder[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
