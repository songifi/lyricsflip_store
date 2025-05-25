import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Lesson } from "./lesson.entity"

@Entity("exercises")
export class Exercise {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  title: string

  @Column("text")
  question: string

  @Column({
    type: "enum",
    enum: ExerciseType,
    default: ExerciseType.MULTIPLE_CHOICE,
  })
  type: ExerciseType

  @Column({
    type: "enum",
    enum: ExerciseDifficulty,
    default: ExerciseDifficulty.MEDIUM,
  })
  difficulty: ExerciseDifficulty

  @Column("simple-json")
  options: Array<{
    id: string
    text: string
    isCorrect?: boolean
    audioUrl?: string
  }>

  @Column("simple-json")
  correctAnswer: any

  @Column("text", { nullable: true })
  explanation: string

  @Column({ default: 1 })
  points: number

  @Column({ default: 0 })
  timeLimit: number // in seconds

  @Column({ nullable: true })
  audioUrl: string

  @Column({ nullable: true })
  imageUrl: string

  @Column("text", { nullable: true })
  instructions: string

  @Column({ default: 0 })
  orderIndex: number

  @Column("uuid")
  lessonId: string

  @ManyToOne(
    () => Lesson,
    (lesson) => lesson.exercises,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "lessonId" })
  lesson: Lesson

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
