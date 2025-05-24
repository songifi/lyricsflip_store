import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Tree,
  TreeParent,
  TreeChildren,
} from "typeorm"
import { Merchandise } from "./merchandise.entity"
import { MerchandiseType } from "../enums/merchandise.enums"

@Entity("merchandise_categories")
@Tree("closure-table")
export class MerchandiseCategory {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 100 })
  name: string

  @Column({ length: 200, unique: true })
  slug: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({
    type: "enum",
    enum: MerchandiseType,
    default: MerchandiseType.OTHER,
  })
  type: MerchandiseType

  @Column({ nullable: true })
  image: string

  @Column({ default: true })
  isActive: boolean

  @Column({ default: 0 })
  sortOrder: number

  @TreeParent()
  parent: MerchandiseCategory

  @TreeChildren()
  children: MerchandiseCategory[]

  @OneToMany(
    () => Merchandise,
    (merchandise) => merchandise.category,
  )
  merchandise: Merchandise[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
