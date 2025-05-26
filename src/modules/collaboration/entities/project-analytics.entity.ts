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
import { Project } from "./project.entity"

@Entity("project_analytics")
@Index(["projectId", "date"])
export class ProjectAnalytics {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "project_id" })
  projectId: string

  @ManyToOne(
    () => Project,
    (project) => project.analytics,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "project_id" })
  project: Project

  @Column({ type: "date" })
  date: Date

  @Column({ type: "jsonb" })
  metrics: {
    activeMembers: number
    tasksCompleted: number
    audioVersionsUploaded: number
    feedbackReceived: number
    collaborationTime: number // in minutes
    memberActivity: {
      userId: string
      timeSpent: number
      actionsPerformed: number
    }[]
    milestones: {
      id: string
      name: string
      completedAt: Date
    }[]
  }

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
