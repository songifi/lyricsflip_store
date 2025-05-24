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
import { Merchandise } from "./merchandise.entity"

@Entity("merchandise_images")
@Index(["merchandiseId", "sortOrder"])
export class MerchandiseImage {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  merchandiseId: string

  @Column()
  url: string

  @Column({ nullable: true })
  thumbnailUrl: string

  @Column({ length: 200, nullable: true })
  altText: string

  @Column({ default: false })
  isPrimary: boolean

  @Column({ default: 0 })
  sortOrder: number

  @Column({ type: "json", nullable: true })
  metadata: {
    width?: number
    height?: number
    size?: number
    format?: string
  }

  @ManyToOne(
    () => Merchandise,
    (merchandise) => merchandise.images,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "merchandiseId" })
  merchandise: Merchandise

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
