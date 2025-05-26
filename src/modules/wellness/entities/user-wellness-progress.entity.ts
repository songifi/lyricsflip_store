import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { WellnessProgram } from "./wellness-program.entity"

@Entity("user_wellness_progress")
export class UserWellnessProgress {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  userId: string

  @Column("uuid")
  programId: string

  @Column({ type: "enum", enum: ProgressStatus, default: ProgressStatus.NOT_STARTED })
  status: ProgressStatus

  @Column("int", { default: 0 })
  completedSessions: number

  @Column("int", { default: 0 })
  totalMinutesSpent: number

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  completionPercentage: number

  @Column("int", { nullable: true })
  currentStreak: number

  @Column("int", { nullable: true })
  longestStreak: number

  @Column({ type: "date", nullable: true })
  lastSessionDate: Date

  @Column("simple-json", { nullable: true })
  personalGoals: Record<string, any>

  @Column("simple-json", { nullable: true })
  preferences: Record<string, any>

  @ManyToOne(
    () => WellnessProgram,
    (program) => program.userProgress,
  )
  @JoinColumn({ name: "programId" })
  program: WellnessProgram

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
