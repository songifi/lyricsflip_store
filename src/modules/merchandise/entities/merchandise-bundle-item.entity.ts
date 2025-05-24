import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm"
import { MerchandiseBundle } from "./merchandise-bundle.entity"
import { Merchandise } from "./merchandise.entity"

@Entity("merchandise_bundle_items")
@Index(["bundleId", "merchandiseId"])
export class MerchandiseBundleItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  bundleId: string

  @Column("uuid")
  merchandiseId: string

  @Column({ default: 1 })
  quantity: number

  @Column({ default: false })
  isOptional: boolean

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  individualPrice: number

  @Column({ default: 0 })
  sortOrder: number

  @ManyToOne(
    () => MerchandiseBundle,
    (bundle) => bundle.items,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "bundleId" })
  bundle: MerchandiseBundle

  @ManyToOne(
    () => Merchandise,
    (merchandise) => merchandise.bundleItems,
  )
  @JoinColumn({ name: "merchandiseId" })
  merchandise: Merchandise

  @CreateDateColumn()
  createdAt: Date
}
