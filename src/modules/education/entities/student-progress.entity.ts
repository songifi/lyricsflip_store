import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Course } from "./course.entity"

@Entity("student_progress")
@Unique(["studentId", "courseId"])
export class StudentProgress {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  studentId: string

  @Column("uuid")
  courseId: string

  @Column({
    type: "enum",
    enum: ProgressStatus,
    default: ProgressStatus.NOT_STARTED,
  })
  status: ProgressStatus

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  completionPercentage: number

  @Column({ default: 0 })
  lessonsCompleted: number

  @Column({ default: 0 })
  totalLessons: number

  @Column({ default: 0 })
  exercisesCompleted: number

  @Column({ default: 0 })
  totalExercises: number

  @Column({ default: 0 })
  assignmentsCompleted: number

  @Column({ default: 0 })
  totalAssignments: number

  @Column({ default: 0 })
  totalTimeSpentMinutes: number

  @Column({ default: 0 })
  totalScore: number

  @Column({ default: 0 })
  maxPossibleScore: number

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  averageScore: number

  @Column({ nullable: true })
  lastAccessedAt: Date

  @Column({ nullable: true })
  completedAt: Date

  @Column({ nullable: true })
  enrolledAt: Date

  @Column("simple-json", { nullable: true })
  streakData: {
    currentStreak: number
    longestStreak: number
    lastActivityDate: Date
  }

  @Column("simple-json", { nullable: true })
  preferences: {
    playbackSpeed: number
    autoplay: boolean
    subtitles: boolean
    notifications: boolean
  }

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "studentId" })
  student: User

  @ManyToOne(
    () => Course,
    (course) => course.studentProgress,
    { eager: true },
  )
  @JoinColumn({ name: "courseId" })
  course: Course

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
