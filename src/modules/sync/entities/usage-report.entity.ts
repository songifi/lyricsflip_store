import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm"
import { SyncLicense } from "./sync-license.entity"

export enum UsageStatus {
  REPORTED = "reported",
  VERIFIED = "verified",
  DISPUTED = "disputed",
  RESOLVED = "resolved",
}

@Entity("usage_reports")
export class UsageReport {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "enum", enum: UsageStatus, default: UsageStatus.REPORTED })
  status: UsageStatus

  @Column({ type: "date" })
  usageDate: Date

  @Column({ type: "varchar", length: 255, nullable: true })
  platform: string

  @Column({ type: "varchar", length: 255, nullable: true })
  territory: string

  @Column({ type: "int", nullable: true })
  viewerCount: number

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  revenue: number

  @Column({ type: "varchar", length: 3, default: "USD" })
  currency: string

  @Column({ type: "int", nullable: true })
  durationUsed: number // seconds

  @Column({ type: "text", nullable: true })
  usageContext: string

  @Column({ type: "jsonb", nullable: true })
  metadata: {
    episodeNumber?: number
    seasonNumber?: number
    airTime?: string
    channel?: string
    streamingService?: string
    additionalInfo?: Record<string, any>
  }

  @Column({ type: "text", nullable: true })
  reportedBy: string

  @Column({ type: "timestamp", nullable: true })
  verifiedAt: Date

  @Column({ type: "uuid", nullable: true })
  verifiedBy: string

  @Column({ type: "text", nullable: true })
  notes: string

  @ManyToOne(
    () => SyncLicense,
    (license) => license.usageReports,
    { eager: true },
  )
  @JoinColumn({ name: "sync_license_id" })
  syncLicense: SyncLicense

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
