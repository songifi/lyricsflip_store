import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Project } from "./project.entity"
import { Feedback } from "./feedback.entity"

export enum AudioVersionType {
  ORIGINAL = "original",
  REVISION = "revision",
  MASTER = "master",
  DEMO = "demo",
  ROUGH_MIX = "rough_mix",
  FINAL_MIX = "final_mix",
}

export enum AudioVersionStatus {
  DRAFT = "draft",
  REVIEW = "review",
  APPROVED = "approved",
  REJECTED = "rejected",
  ARCHIVED = "archived",
}

@Entity("audio_versions")
@Index(["projectId", "versionNumber"])
@Index(["projectId", "status"])
export class AudioVersion {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "project_id" })
  projectId: string

  @ManyToOne(
    () => Project,
    (project) => project.audioVersions,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "project_id" })
  project: Project

  @Column({ name: "uploaded_by_id" })
  uploadedById: string

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "uploaded_by_id" })
  uploadedBy: User

  @Column({ name: "version_number" })
  versionNumber: number

  @Column({ length: 255 })
  title: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({
    type: "enum",
    enum: AudioVersionType,
    default: AudioVersionType.REVISION,
  })
  type: AudioVersionType

  @Column({
    type: "enum",
    enum: AudioVersionStatus,
    default: AudioVersionStatus.DRAFT,
  })
  status: AudioVersionStatus

  @Column({ name: "file_url" })
  fileUrl: string

  @Column({ name: "file_name" })
  fileName: string

  @Column({ name: "file_size" })
  fileSize: number

  @Column({ name: "file_format" })
  fileFormat: string

  @Column({ type: "integer", nullable: true })
  duration: number // in seconds

  @Column({ type: "jsonb", nullable: true })
  waveformData: number[]

  @Column({ type: "jsonb", nullable: true })
  metadata: {
    bitrate: number
    sampleRate: number
    channels: number
    codec: string
    bpm: number
    key: string
  }

  @Column({ type: "jsonb", nullable: true })
  changes: {
    summary: string
    details: string[]
    timestamp: Date
  }

  @Column({ name: "parent_version_id", nullable: true })
  parentVersionId: string

  @ManyToOne(() => AudioVersion, { nullable: true })
  @JoinColumn({ name: "parent_version_id" })
  parentVersion: AudioVersion

  @OneToMany(
    () => Feedback,
    (feedback) => feedback.audioVersion,
    {
      cascade: true,
    },
  )
  feedback: Feedback[]

  @Column({ type: "boolean", default: false })
  isCurrentVersion: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
