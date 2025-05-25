import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Podcast } from "./podcast.entity"

export enum MonetizationType {
  SUBSCRIPTION = "subscription",
  DONATION = "donation",
  SPONSORSHIP = "sponsorship",
  PREMIUM_CONTENT = "premium_content",
  MERCHANDISE = "merchandise",
}

@Entity("monetization_plans")
export class MonetizationPlan {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  name: string

  @Column("text", { nullable: true })
  description: string

  @Column({
    type: "enum",
    enum: MonetizationType,
  })
  type: MonetizationType

  @Column("decimal", { precision: 10, scale: 2 })
  price: number

  @Column({ length: 3, default: "USD" })
  currency: string

  @Column({ default: true })
  active: boolean

  @Column("json", { nullable: true })
  features: Record<string, any>

  @Column("json", { nullable: true })
  metadata: Record<string, any>

  @Column("uuid")
  podcastId: string

  @ManyToOne(
    () => Podcast,
    (podcast) => podcast.monetizationPlans,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "podcastId" })
  podcast: Podcast

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
