import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Project } from "./project.entity"

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  REVIEW = "review",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum TaskType {
  COMPOSITION = "composition",
  RECORDING = "recording",
  MIXING = "mixing",
  MASTERING = "mastering",
  EDITING = "editing",
  REVIEW = "review",
  APPROVAL = "approval",
  OTHER = "other",
}

@Entity("tasks")
@Index(["projectId", "status"])
@Index(["assigneeId", "status"])
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "project_id" })
  projectId: string

  @ManyToOne(
    () => Project,
    (project) => project.tasks,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "project_id" })
  project: Project

  @Column({ name: "created_by_id" })
  createdById: string

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "created_by_id" })
  createdBy: User

  @Column({ name: "assignee_id", nullable: true })
  assigneeId: string

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "assignee_id" })
  assignee: User

  @Column({ length: 255 })
  title: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({
    type: "enum",
    enum: TaskType,
    default: TaskType.OTHER,
  })
  type: TaskType

  @Column({
    type: "enum",
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus

  @Column({
    type: "enum",
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority

  @Column({ type: "timestamp", nullable: true })
  dueDate: Date

  @Column({ type: "timestamp", nullable: true })
  startedAt: Date

  @Column({ type: "timestamp", nullable: true })
  completedAt: Date

  @Column({ type: "integer", nullable: true })
  estimatedHours: number

  @Column({ type: "integer", nullable: true })
  actualHours: number

  @Column({ type: "jsonb", nullable: true })
  attachments: {
    id: string
    name: string
    url: string
    type: string
    size: number
  }[]

  @Column({ type: "jsonb", nullable: true })
  dependencies: string[] // Task IDs that must be completed first

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
