import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm"
import { Stage } from "./stage.entity"
import { Vendor } from "./vendor.entity"
import { Sponsor } from "./sponsor.entity"
import { FestivalLocation } from "./festival-location.entity"
import { FestivalAttendee } from "./festival-attendee.entity"
import { User } from "./user.entity"

@Entity("festivals")
export class Festival {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  name: string

  @Column("text", { nullable: true })
  description: string

  @Column("date")
  startDate: Date

  @Column("date")
  endDate: Date

  @Column({ length: 255 })
  location: string

  @Column("decimal", { precision: 10, scale: 6, nullable: true })
  latitude: number

  @Column("decimal", { precision: 10, scale: 6, nullable: true })
  longitude: number

  @Column({
    type: "enum",
    enum: FestivalStatus,
    default: FestivalStatus.PLANNING,
  })
  status: FestivalStatus

  @Column("int", { default: 0 })
  capacity: number

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  ticketPrice: number

  @Column("json", { nullable: true })
  ticketTiers: {
    name: string
    price: number
    capacity: number
    benefits: string[]
  }[]

  @Column("json", { nullable: true })
  amenities: string[]

  @Column("json", { nullable: true })
  rules: string[]

  @Column({ length: 500, nullable: true })
  imageUrl: string

  @Column("json", { nullable: true })
  socialMedia: {
    website?: string
    facebook?: string
    instagram?: string
    twitter?: string
  }

  @OneToMany(
    () => Stage,
    (stage) => stage.festival,
    { cascade: true },
  )
  stages: Stage[]

  @OneToMany(
    () => Vendor,
    (vendor) => vendor.festival,
    { cascade: true },
  )
  vendors: Vendor[]

  @OneToMany(
    () => Sponsor,
    (sponsor) => sponsor.festival,
    { cascade: true },
  )
  sponsors: Sponsor[]

  @OneToMany(
    () => FestivalLocation,
    (location) => location.festival,
    {
      cascade: true,
    },
  )
  mapLocations: FestivalLocation[]

  @OneToMany(
    () => FestivalAttendee,
    (attendee) => attendee.festival,
  )
  attendees: FestivalAttendee[]

  @ManyToMany(() => User)
  @JoinTable({ name: "festival_organizers" })
  organizers: User[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
