import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Lesson } from "./lesson.entity"

@Entity("lesson_completions")
@Unique(["studentId", "lessonId"])
export class LessonCompletion {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  studentId: string

  @Column("uuid")
  lessonId: string

  @Column({ default: 0 })
  timeSpentMinutes: number

  @Column({ default: 0 })
  videoWatchTimeSeconds: number

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  completionPercentage: number

  @Column({ default: 0 })
  exercisesCompleted: number

  @Column({ default: 0 })
  totalExercises: number

  @Column({ default: 0 })
  score: number

  @Column({ default: 0 })
  maxScore: number

  @Column({ default: 0 })
  attempts: number

  @Column({ nullable: true })
  firstAccessedAt: Date

  @Column({ nullable: true })
  lastAccessedAt: Date

  @Column({ nullable: true })
  completedAt: Date

  @Column("simple-json", { nullable: true })
  watchProgress: Array<{
    videoId: string
    watchedSeconds: number
    totalSeconds: number
    completed: boolean
  }>

  @Column("simple-json", { nullable: true })
  notes: Array<{
    timestamp: number
    content: string
    createdAt: Date
  }>

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "studentId" })
  student: User

  @ManyToOne(
    () => Lesson,
    (lesson) => lesson.completions,
    { eager: true },
  )
  @JoinColumn({ name: "lessonId" })
  lesson: Lesson

  @CreateDateColumn()
  createdAt: Date
}
