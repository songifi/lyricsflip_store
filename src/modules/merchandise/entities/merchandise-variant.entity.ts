import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from "typeorm"
import { Merchandise } from "./merchandise.entity"
import { MerchandiseInventory } from "./merchandise-inventory.entity"
import { VariantType } from "../enums/variantType.enum"

@Entity("merchandise_variants")
@Index(["merchandiseId", "isActive"])
@Unique(["merchandiseId", "sku"])
export class MerchandiseVariant {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  merchandiseId: string

  @Column({ length: 100 })
  name: string

  @Column({ length: 100, unique: true })
  sku: string

  @Column({
    type: "enum",
    enum: VariantType,
  })
  type: VariantType

  @Column({ length: 100 })
  value: string

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  priceModifier: number

  @Column({ default: true })
  isActive: boolean

  @Column({ nullable: true })
  image: string

  @Column({ type: "decimal", precision: 8, scale: 3, nullable: true })
  weight: number

  @Column({ type: "json", nullable: true })
  attributes: Record<string, any>

  @Column({ default: 0 })
  sortOrder: number

  @ManyToOne(
    () => Merchandise,
    (merchandise) => merchandise.variants,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "merchandiseId" })
  merchandise: Merchandise

  @OneToMany(
    () => MerchandiseInventory,
    (inventory) => inventory.variant,
    {
      cascade: true,
    },
  )
  inventory: MerchandiseInventory[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
