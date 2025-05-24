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
import { MerchandiseBundleItem } from "./merchandise-bundle-item.entity"
import { BundleType } from "../enums/bundleType.enum"
import { MerchandiseStatus } from "../enums/merchandiseStatus.enum"

@Entity("merchandise_bundles")
@Index(["artistId", "status"])
export class MerchandiseBundle {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 200 })
  name: string

  @Column({ length: 300, unique: true })
  slug: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column("uuid")
  artistId: string

  @Column({
    type: "enum",
    enum: BundleType,
    default: BundleType.FIXED,
  })
  type: BundleType

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  compareAtPrice: number

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  discountPercentage: number

  @Column({
    type: "enum",
    enum: MerchandiseStatus,
    default: MerchandiseStatus.DRAFT,
  })
  status: MerchandiseStatus

  @Column({ default: false })
  isLimitedEdition: boolean

  @Column({ nullable: true })
  limitedQuantity: number

  @Column({ type: "timestamp", nullable: true })
  validFrom: Date

  @Column({ type: "timestamp", nullable: true })
  validUntil: Date

  @Column({ nullable: true })
  image: string

  @Column({ type: "json", nullable: true })
  tags: string[]

  @ManyToOne(
    () => Artist,
    (artist) => artist.merchandiseBundles,
  )
  @JoinColumn({ name: "artistId" })
  artist: Artist

  @OneToMany(
    () => MerchandiseBundleItem,
    (item) => item.bundle,
    {
      cascade: true,
    },
  )
  items: MerchandiseBundleItem[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
