import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { MediaType, UsageType, Territory } from "./sync-license.entity"

export enum OpportunityStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  FILLED = "filled",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export enum OpportunityPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

@Entity("sync_opportunities")
export class SyncOpportunity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255 })
  title: string

  @Column({ type: "text" })
  description: string

  @Column({ type: "enum", enum: OpportunityStatus, default: OpportunityStatus.OPEN })
  status: OpportunityStatus

  @Column({ type: "enum", enum: OpportunityPriority, default: OpportunityPriority.MEDIUM })
  priority: OpportunityPriority

  @Column({ type: "enum", enum: MediaType })
  mediaType: MediaType

  @Column({ type: "enum", enum: UsageType })
  usageType: UsageType

  @Column({ type: "enum", enum: Territory })
  territory: Territory

  @Column({ type: "varchar", length: 255 })
  clientCompany: string

  @Column({ type: "varchar", length: 255 })
  contactEmail: string

  @Column({ type: "varchar", length: 255, nullable: true })
  contactName: string

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  budgetMin: number

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  budgetMax: number

  @Column({ type: "varchar", length: 3, default: "USD" })
  currency: string

  @Column({ type: "date" })
  deadline: Date

  @Column({ type: "date", nullable: true })
  usageStartDate: Date

  @Column({ type: "date", nullable: true })
  usageEndDate: Date

  @Column({ type: "jsonb" })
  musicRequirements: {
    genres: string[]
    moods: string[]
    instruments: string[]
    tempo: {
      min: number
      max: number
    }
    duration: {
      min: number
      max: number
    }
    vocals: boolean
    instrumental: boolean
    language?: string[]
    era?: string
    style?: string[]
  }

  @Column({ type: "text", array: true, nullable: true })
  tags: string[]

  @Column({ type: "text", nullable: true })
  additionalNotes: string

  @Column({ type: "int", default: 0 })
  submissionCount: number

  @Column({ type: "timestamp", nullable: true })
  filledAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
