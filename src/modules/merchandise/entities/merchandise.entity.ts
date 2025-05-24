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
} from "typeorm"
import { Artist } from "src/modules/artists/entities/artist.entity"
import { MerchandiseCategory } from "./merchandise-category.entity"
import { MerchandiseVariant } from "./merchandise-variant.entity"
import { MerchandiseImage } from "./merchandise-image.entity"
import { MerchandiseBundleItem } from "./merchandise-bundle-item.entity"
import { MerchandiseStatus } from "../enums/merchandiseStatus.enum"

@Entity("merchandise")
@Index(["artistId", "status"])
@Index(["categoryId", "status"])
export class Merchandise {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 200 })
  name: string

  @Column({ length: 300, unique: true })
  slug: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ type: "text", nullable: true })
  shortDescription: string

  @Column("uuid")
  artistId: string

  @Column("uuid")
  categoryId: string

  @Column({ length: 100, nullable: true })
  sku: string

  @Column({ type: "decimal", precision: 10, scale: 2 })
  basePrice: number

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  compareAtPrice: number

  @Column({
    type: "enum",
    enum: MerchandiseStatus,
    default: MerchandiseStatus.DRAFT,
  })
  status: MerchandiseStatus

  @Column({ default: false })
  isLimitedEdition: boolean

  @Column({ nullable: true })
  limitedEditionQuantity: number

  @Column({ default: false })
  isPreOrder: boolean

  @Column({ type: "timestamp", nullable: true })
  preOrderReleaseDate: Date

  @Column({ default: false })
  requiresShipping: boolean

  @Column({ type: "decimal", precision: 8, scale: 3, nullable: true })
  weight: number

  @Column({ type: "json", nullable: true })
  dimensions: {
    length?: number
    width?: number
    height?: number
    unit?: string
  }

  @Column({ type: "json", nullable: true })
  tags: string[]

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>

  @Column({ default: 0 })
  sortOrder: number

  @Column({ type: "timestamp", nullable: true })
  publishedAt: Date

  @ManyToOne(
    () => Artist,
    (artist) => artist.merchandise,
  )
  @JoinColumn({ name: "artistId" })
  artist: Artist

  @ManyToOne(
    () => MerchandiseCategory,
    (category) => category.merchandise,
  )
  @JoinColumn({ name: "categoryId" })
  category: MerchandiseCategory

  @OneToMany(
    () => MerchandiseVariant,
    (variant) => variant.merchandise,
    {
      cascade: true,
    },
  )
  variants: MerchandiseVariant[]

  @OneToMany(
    () => MerchandiseImage,
    (image) => image.merchandise,
    {
      cascade: true,
    },
  )
  images: MerchandiseImage[]

  @OneToMany(
    () => MerchandiseBundleItem,
    (bundleItem) => bundleItem.merchandise,
  )
  bundleItems: MerchandiseBundleItem[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
