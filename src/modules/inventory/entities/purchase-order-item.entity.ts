import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { PurchaseOrder } from "./purchase-order.entity"
import { InventoryItem } from "./inventory-item.entity"

@Entity("purchase_order_items")
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  purchaseOrderId: string

  @ManyToOne(
    () => PurchaseOrder,
    (order) => order.items,
  )
  @JoinColumn({ name: "purchaseOrderId" })
  purchaseOrder: PurchaseOrder

  @Column()
  inventoryItemId: string

  @ManyToOne(() => InventoryItem)
  @JoinColumn({ name: "inventoryItemId" })
  inventoryItem: InventoryItem

  @Column({ type: "int" })
  quantityOrdered: number

  @Column({ type: "int", default: 0 })
  quantityReceived: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  unitPrice: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  totalPrice: number
}
