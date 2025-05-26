import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Project } from "./project.entity"

export enum TimelineEventType {
  PROJECT_CREATED = "project_created",
  MEMBER_ADDED = "member_added",
  MEMBER_REMOVED = "member_removed",
  AUDIO_UPLOADED = "audio_uploaded",
  AUDIO_APPROVED = "audio_approved",
  TASK_CREATED = "task_created",
  TASK_COMPLETED = "task_completed",
  MILESTONE_REACHED = "milestone_reached",
  FEEDBACK_ADDED = "feedback_added",
  STATUS_CHANGED = "status_changed",
  DEADLINE_UPDATED = "deadline_updated",
}

@Entity("timeline")
@Index(["projectId", "createdAt"])
export class Timeline {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "project_id" })
  projectId: string

  @ManyToOne(
    () => Project,
    (project) => project.timeline,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "project_id" })
  project: Project

  @Column({ name: "user_id", nullable: true })
  userId: string

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "user_id" })
  user: User

  @Column({
    type: "enum",
    enum: TimelineEventType,
  })
  eventType: TimelineEventType

  @Column({ length: 255 })
  title: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ type: "jsonb", nullable: true })
  metadata: {
    entityId?: string
    entityType?: string
    oldValue?: any
    newValue?: any
    [key: string]: any
  }

  @CreateDateColumn()
  createdAt: Date
}
