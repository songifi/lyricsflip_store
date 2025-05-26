import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm"
import { Track } from "./track.entity"
import { MediaProject } from "./media-project.entity"
import { SyncClient } from "./sync-client.entity"
import { UsageReport } from "./usage-report.entity"
import { SyncFeeCalculation } from "./sync-fee-calculation.entity"

export enum SyncLicenseStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  ACTIVE = "active",
  EXPIRED = "expired",
  TERMINATED = "terminated",
}

export enum MediaType {
  FILM = "film",
  TV_SERIES = "tv_series",
  TV_EPISODE = "tv_episode",
  COMMERCIAL = "commercial",
  DOCUMENTARY = "documentary",
  WEB_SERIES = "web_series",
  PODCAST = "podcast",
  VIDEO_GAME = "video_game",
  TRAILER = "trailer",
  OTHER = "other",
}

export enum UsageType {
  BACKGROUND = "background",
  FEATURED = "featured",
  THEME = "theme",
  OPENING_CREDITS = "opening_credits",
  CLOSING_CREDITS = "closing_credits",
  MONTAGE = "montage",
  PROMOTIONAL = "promotional",
}

export enum Territory {
  WORLDWIDE = "worldwide",
  NORTH_AMERICA = "north_america",
  EUROPE = "europe",
  ASIA_PACIFIC = "asia_pacific",
  LATIN_AMERICA = "latin_america",
  SPECIFIC_COUNTRIES = "specific_countries",
}

@Entity("sync_licenses")
export class SyncLicense {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 100, unique: true })
  licenseNumber: string

  @Column({ type: "enum", enum: SyncLicenseStatus, default: SyncLicenseStatus.PENDING })
  status: SyncLicenseStatus

  @Column({ type: "enum", enum: MediaType })
  mediaType: MediaType

  @Column({ type: "enum", enum: UsageType })
  usageType: UsageType

  @Column({ type: "enum", enum: Territory })
  territory: Territory

  @Column({ type: "text", array: true, nullable: true })
  specificCountries: string[]

  @Column({ type: "decimal", precision: 10, scale: 2 })
  licenseFee: number

  @Column({ type: "varchar", length: 3, default: "USD" })
  currency: string

  @Column({ type: "date" })
  startDate: Date

  @Column({ type: "date" })
  endDate: Date

  @Column({ type: "int", nullable: true })
  durationSeconds: number

  @Column({ type: "text", nullable: true })
  usageDescription: string

  @Column({ type: "jsonb", nullable: true })
  usageTerms: {
    exclusivity: boolean
    modifications: boolean
    creditRequired: boolean
    creditText?: string
    restrictions?: string[]
    additionalTerms?: string
  }

  @Column({ type: "jsonb", nullable: true })
  distributionRights: {
    theatrical: boolean
    television: boolean
    streaming: boolean
    digital: boolean
    physical: boolean
    educational: boolean
    promotional: boolean
  }

  @Column({ type: "text", nullable: true })
  notes: string

  @Column({ type: "timestamp", nullable: true })
  approvedAt: Date

  @Column({ type: "uuid", nullable: true })
  approvedBy: string

  @ManyToOne(() => Track, { eager: true })
  @JoinColumn({ name: "track_id" })
  track: Track

  @ManyToOne(
    () => MediaProject,
    (project) => project.syncLicenses,
    { eager: true },
  )
  @JoinColumn({ name: "media_project_id" })
  mediaProject: MediaProject

  @ManyToOne(
    () => SyncClient,
    (client) => client.syncLicenses,
    { eager: true },
  )
  @JoinColumn({ name: "client_id" })
  client: SyncClient

  @OneToMany(
    () => UsageReport,
    (report) => report.syncLicense,
  )
  usageReports: UsageReport[]

  @OneToMany(
    () => SyncFeeCalculation,
    (calculation) => calculation.syncLicense,
  )
  feeCalculations: SyncFeeCalculation[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
