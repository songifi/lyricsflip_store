import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Festival } from "./festival.entity"

@Entity("vendors")
export class Vendor {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  name: string

  @Column("text", { nullable: true })
  description: string

  @Column({
    type: "enum",
    enum: VendorType,
  })
  type: VendorType

  @Column({
    type: "enum",
    enum: VendorStatus,
    default: VendorStatus.PENDING,
  })
  status: VendorStatus

  @Column({ length: 255 })
  contactName: string

  @Column({ length: 255 })
  contactEmail: string

  @Column({ length: 20 })
  contactPhone: string

  @Column("decimal", { precision: 10, scale: 6, nullable: true })
  latitude: number

  @Column("decimal", { precision: 10, scale: 6, nullable: true })
  longitude: number

  @Column("json", { nullable: true })
  operatingHours: {
    [key: string]: {
      open: string
      close: string
      isOpen: boolean
    }
  }

  @Column("json", { nullable: true })
  menu: {
    category: string
    items: {
      name: string
      price: number
      description?: string
    }[]
  }[]

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  fee: number

  @Column("decimal", { precision: 5, scale: 2, nullable: true })
  revenueShare: number

  @Column("json", { nullable: true })
  requirements: {
    space: {
      width: number
      depth: number
    }
    power: string
    water: boolean
    waste: boolean
    equipment: string[]
  }

  @ManyToOne(
    () => Festival,
    (festival) => festival.vendors,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "festivalId" })
  festival: Festival

  @Column("uuid")
  festivalId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
