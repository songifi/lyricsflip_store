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

@Entity("festival_analytics")
export class FestivalAnalytics {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: AnalyticsType,
  })
  type: AnalyticsType

  @Column("date")
  date: Date

  @Column("json")
  data: {
    [key: string]: any
  }

  @Column("json", { nullable: true })
  metadata: {
    source: string
    version: string
    notes?: string
  }

  @ManyToOne(() => Festival, { onDelete: "CASCADE" })
  @JoinColumn({ name: "festivalId" })
  festival: Festival

  @Column("uuid")
  festivalId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
