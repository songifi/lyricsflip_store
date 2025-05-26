import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { MediaProject } from "./media-project.entity"
import { SyncLicense } from "./sync-license.entity"

export enum ClientType {
  PRODUCTION_COMPANY = "production_company",
  ADVERTISING_AGENCY = "advertising_agency",
  BROADCASTER = "broadcaster",
  STREAMING_PLATFORM = "streaming_platform",
  INDEPENDENT_FILMMAKER = "independent_filmmaker",
  MUSIC_SUPERVISOR = "music_supervisor",
  GAME_DEVELOPER = "game_developer",
  PODCAST_PRODUCER = "podcast_producer",
  OTHER = "other",
}

export enum ClientStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING_APPROVAL = "pending_approval",
}

@Entity("sync_clients")
export class SyncClient {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255 })
  companyName: string

  @Column({ type: "enum", enum: ClientType })
  type: ClientType

  @Column({ type: "enum", enum: ClientStatus, default: ClientStatus.PENDING_APPROVAL })
  status: ClientStatus

  @Column({ type: "varchar", length: 255 })
  contactName: string

  @Column({ type: "varchar", length: 255 })
  contactEmail: string

  @Column({ type: "varchar", length: 50, nullable: true })
  contactPhone: string

  @Column({ type: "text", nullable: true })
  address: string

  @Column({ type: "varchar", length: 100, nullable: true })
  city: string

  @Column({ type: "varchar", length: 100, nullable: true })
  country: string

  @Column({ type: "varchar", length: 20, nullable: true })
  postalCode: string

  @Column({ type: "varchar", length: 255, nullable: true })
  website: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ type: "text", array: true, nullable: true })
  specializations: string[]

  @Column({ type: "jsonb", nullable: true })
  creditRating: {
    score: number
    agency: string
    lastUpdated: Date
  }

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
  creditLimit: number

  @Column({ type: "varchar", length: 3, default: "USD" })
  currency: string

  @Column({ type: "int", default: 30 })
  paymentTerms: number // days

  @Column({ type: "text", nullable: true })
  notes: string

  @OneToMany(
    () => MediaProject,
    (project) => project.client,
  )
  mediaProjects: MediaProject[]

  @OneToMany(
    () => SyncLicense,
    (license) => license.client,
  )
  syncLicenses: SyncLicense[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
