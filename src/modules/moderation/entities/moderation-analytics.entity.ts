import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"
import { ContentType, ViolationType, ModerationStatus } from "./moderation-case.entity"

@Entity("moderation_analytics")
export class ModerationAnalytics {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "date" })
  date: Date

  @Column({ type: "enum", enum: ContentType, nullable: true })
  contentType: ContentType

  @Column({ type: "enum", enum: ViolationType, nullable: true })
  violationType: ViolationType

  @Column({ type: "enum", enum: ModerationStatus, nullable: true })
  status: ModerationStatus

  @Column({ default: 0 })
  totalCases: number

  @Column({ default: 0 })
  automatedCases: number

  @Column({ default: 0 })
  manualCases: number

  @Column({ default: 0 })
  approvedCases: number

  @Column({ default: 0 })
  rejectedCases: number

  @Column({ default: 0 })
  appealedCases: number

  @Column({ type: "float", default: 0 })
  averageProcessingTime: number

  @Column({ type: "float", default: 0 })
  accuracyRate: number

  @CreateDateColumn()
  createdAt: Date
}
