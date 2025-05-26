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
import { SyncClient } from "./sync-client.entity"
import { SyncLicense } from "./sync-license.entity"
import { MediaType } from "./sync-license.entity"

export enum ProjectStatus {
  DEVELOPMENT = "development",
  PRE_PRODUCTION = "pre_production",
  PRODUCTION = "production",
  POST_PRODUCTION = "post_production",
  COMPLETED = "completed",
  RELEASED = "released",
  CANCELLED = "cancelled",
}

@Entity("media_projects")
export class MediaProject {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255 })
  title: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ type: "enum", enum: MediaType })
  type: MediaType

  @Column({ type: "enum", enum: ProjectStatus, default: ProjectStatus.DEVELOPMENT })
  status: ProjectStatus

  @Column({ type: "varchar", length: 255, nullable: true })
  genre: string

  @Column({ type: "int", nullable: true })
  estimatedDuration: number // in minutes

  @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
  budget: number

  @Column({ type: "varchar", length: 3, default: "USD" })
  currency: string

  @Column({ type: "date", nullable: true })
  expectedReleaseDate: Date

  @Column({ type: "date", nullable: true })
  actualReleaseDate: Date

  @Column({ type: "varchar", length: 255, nullable: true })
  productionCompany: string

  @Column({ type: "varchar", length: 255, nullable: true })
  distributor: string

  @Column({ type: "text", array: true, nullable: true })
  targetAudience: string[]

  @Column({ type: "jsonb", nullable: true })
  musicRequirements: {
    totalTracksNeeded: number
    genres: string[]
    moods: string[]
    instruments: string[]
    tempo: string[]
    duration: {
      min: number
      max: number
    }
    budget: {
      perTrack: number
      total: number
    }
  }

  @Column({ type: "text", nullable: true })
  notes: string

  @ManyToOne(
    () => SyncClient,
    (client) => client.mediaProjects,
    { eager: true },
  )
  @JoinColumn({ name: "client_id" })
  client: SyncClient

  @OneToMany(
    () => SyncLicense,
    (license) => license.mediaProject,
  )
  syncLicenses: SyncLicense[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
