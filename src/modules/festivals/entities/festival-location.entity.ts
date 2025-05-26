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

@Entity("festival_locations")
export class FestivalLocation {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  name: string

  @Column("text", { nullable: true })
  description: string

  @Column({
    type: "enum",
    enum: LocationType,
  })
  type: LocationType

  @Column("decimal", { precision: 10, scale: 6 })
  latitude: number

  @Column("decimal", { precision: 10, scale: 6 })
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
  amenities: string[]

  @Column("json", { nullable: true })
  accessibility: {
    wheelchairAccessible: boolean
    signLanguage: boolean
    audioAssistance: boolean
    visualAssistance: boolean
    notes: string
  }

  @Column({ default: true })
  isActive: boolean

  @Column("int", { nullable: true })
  capacity: number

  @Column({ length: 500, nullable: true })
  imageUrl: string

  @ManyToOne(
    () => Festival,
    (festival) => festival.mapLocations,
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
