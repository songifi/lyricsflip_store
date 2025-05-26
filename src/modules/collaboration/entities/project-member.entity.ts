import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Project } from "./project.entity"

export enum MemberRole {
  OWNER = "owner",
  ADMIN = "admin",
  PRODUCER = "producer",
  ARTIST = "artist",
  SONGWRITER = "songwriter",
  ENGINEER = "engineer",
  VIEWER = "viewer",
}

export enum MemberStatus {
  PENDING = "pending",
  ACTIVE = "active",
  INACTIVE = "inactive",
  REMOVED = "removed",
}

@Entity("project_members")
@Unique(["projectId", "userId"])
@Index(["projectId", "status"])
export class ProjectMember {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "project_id" })
  projectId: string

  @ManyToOne(
    () => Project,
    (project) => project.members,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "project_id" })
  project: Project

  @Column({ name: "user_id" })
  userId: string

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User

  @Column({
    type: "enum",
    enum: MemberRole,
    default: MemberRole.VIEWER,
  })
  role: MemberRole

  @Column({
    type: "enum",
    enum: MemberStatus,
    default: MemberStatus.PENDING,
  })
  status: MemberStatus

  @Column({ type: "jsonb", nullable: true })
  permissions: {
    canEditProject: boolean
    canInviteMembers: boolean
    canManageTasks: boolean
    canUploadAudio: boolean
    canDownloadAudio: boolean
    canLeaveComments: boolean
  }

  @Column({ type: "timestamp", nullable: true })
  joinedAt: Date

  @Column({ type: "timestamp", nullable: true })
  lastActiveAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
