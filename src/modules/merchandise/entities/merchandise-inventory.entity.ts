import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { MerchandiseVariant } from "./merchandise-variant.entity"
import { InventoryStatus } from "../enums/inventoryStatus.enum"

@Entity("merchandise_inventory")
@Index(["variantId"])
@Index(["status"])
export class MerchandiseInventory {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  variantId: string

  @Column({ default: 0 })
  quantity: number

  @Column({ default: 0 })
  reserved: number

  @Column({ default: 0 })
  lowStockThreshold: number

  @Column({
    type: "enum",
    enum: InventoryStatus,
    default: InventoryStatus.IN_STOCK,
  })
  status: InventoryStatus

  @Column({ nullable: true })
  location: string

  @Column({ type: "timestamp", nullable: true })
  lastRestockedAt: Date

  @Column({ type: "timestamp", nullable: true })
  expectedRestockDate: Date

  @Column({ type: "json", nullable: true })
  notes: string[]

  @ManyToOne(
    () => MerchandiseVariant,
    (variant) => variant.inventory,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "variantId" })
  variant: MerchandiseVariant

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  // Computed property
  get availableQuantity(): number {
    return Math.max(0, this.quantity - this.reserved)
  }
}
