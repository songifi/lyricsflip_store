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
import { User } from "./user.entity"

@Entity("festival_attendees")
export class FestivalAttendee {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: TicketType,
    default: TicketType.GENERAL,
  })
  ticketType: TicketType

  @Column({
    type: "enum",
    enum: AttendeeStatus,
    default: AttendeeStatus.REGISTERED,
  })
  status: AttendeeStatus

  @Column({ length: 255, unique: true })
  ticketCode: string

  @Column("decimal", { precision: 10, scale: 2 })
  pricePaid: number

  @Column("timestamp", { nullable: true })
  checkInTime: Date

  @Column("timestamp", { nullable: true })
  checkOutTime: Date

  @Column("json", { nullable: true })
  preferences: {
    favoriteGenres: string[]
    favoriteArtists: string[]
    dietaryRestrictions: string[]
    accessibility: string[]
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
  }

  @Column("json", { nullable: true })
  schedule: {
    performanceId: string
    reminder: boolean
    notes?: string
  }[]

  @Column("json", { nullable: true })
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }

  @ManyToOne(
    () => Festival,
    (festival) => festival.attendees,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "festivalId" })
  festival: Festival

  @Column("uuid")
  festivalId: string

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "userId" })
  user: User

  @Column("uuid")
  userId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
