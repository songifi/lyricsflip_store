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
import { ProjectMember } from "./project-member.entity"
import { Task } from "./task.entity"
import { AudioVersion } from "./audio-version.entity"
import { Timeline } from "./timeline.entity"
import { ProjectAnalytics } from "./project-analytics.entity"

export enum ProjectStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  ON_HOLD = "on_hold",
  COMPLETED = "completed",
  ARCHIVED = "archived",
}

export enum ProjectType {
  TRACK = "track",
  ALBUM = "album",
  EP = "ep",
  SINGLE = "single",
  REMIX = "remix",
  COLLABORATION = "collaboration",
}

@Entity("projects")
@Index(["status", "createdAt"])
@Index(["ownerId", "status"])
export class Project {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  title: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({
    type: "enum",
    enum: ProjectType,
    default: ProjectType.TRACK,
  })
  type: ProjectType

  @Column({
    type: "enum",
    enum: ProjectStatus,
    default: ProjectStatus.DRAFT,
  })
  status: ProjectStatus

  @Column({ name: "owner_id" })
  ownerId: string

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "owner_id" })
  owner: User

  @Column({ type: "timestamp", nullable: true })
  deadline: Date

  @Column({ type: "jsonb", nullable: true })
  settings: {
    isPublic: boolean
    allowInvites: boolean
    requireApproval: boolean
    maxMembers: number
    genres: string[]
    tags: string[]
  }

  @Column({ type: "jsonb", nullable: true })
  metadata: {
    bpm: number
    key: string
    timeSignature: string
    genre: string
    mood: string[]
  }

  @OneToMany(
    () => ProjectMember,
    (member) => member.project,
    {
      cascade: true,
    },
  )
  members: ProjectMember[]

  @OneToMany(
    () => Task,
    (task) => task.project,
    {
      cascade: true,
    },
  )
  tasks: Task[]

  @OneToMany(
    () => AudioVersion,
    (version) => version.project,
    {
      cascade: true,
    },
  )
  audioVersions: AudioVersion[]

  @OneToMany(
    () => Timeline,
    (timeline) => timeline.project,
    {
      cascade: true,
    },
  )
  timeline: Timeline[]

  @OneToMany(
    () => ProjectAnalytics,
    (analytics) => analytics.project,
  )
  analytics: ProjectAnalytics[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
