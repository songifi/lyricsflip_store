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

@Entity("sponsors")
export class Sponsor {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  name: string

  @Column("text", { nullable: true })
  description: string

  @Column({
    type: "enum",
    enum: SponsorTier,
  })
  tier: SponsorTier

  @Column({
    type: "enum",
    enum: SponsorStatus,
    default: SponsorStatus.PROSPECT,
  })
  status: SponsorStatus

  @Column({ length: 255 })
  contactName: string

  @Column({ length: 255 })
  contactEmail: string

  @Column({ length: 20 })
  contactPhone: string

  @Column("decimal", { precision: 12, scale: 2 })
  sponsorshipValue: number

  @Column("json", { nullable: true })
  benefits: {
    branding: string[]
    tickets: number
    hospitality: string[]
    marketing: string[]
    activation: string[]
  }

  @Column("json", { nullable: true })
  deliverables: {
    item: string
    deadline: Date
    status: "pending" | "in_progress" | "completed"
    notes?: string
  }[]

  @Column({ length: 500, nullable: true })
  logoUrl: string

  @Column("json", { nullable: true })
  brandingGuidelines: {
    colors: string[]
    fonts: string[]
    logoUsage: string
    restrictions: string[]
  }

  @Column("date", { nullable: true })
  contractStartDate: Date

  @Column("date", { nullable: true })
  contractEndDate: Date

  @ManyToOne(
    () => Festival,
    (festival) => festival.sponsors,
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
