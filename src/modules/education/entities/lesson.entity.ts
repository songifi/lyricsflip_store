import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm"
import { Course } from "./course.entity"
import { VideoTutorial } from "./video-tutorial.entity"
import { Exercise } from "./exercise.entity"
import { Assignment } from "./assignment.entity"
import { LessonCompletion } from "./lesson-completion.entity"

@Entity("lessons")
export class Lesson {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  title: string

  @Column("text")
  description: string

  @Column("text", { nullable: true })
  content: string

  @Column({
    type: "enum",
    enum: LessonType,
    default: LessonType.VIDEO,
  })
  type: LessonType

  @Column({ default: 0 })
  orderIndex: number

  @Column({ default: 0 })
  estimatedDurationMinutes: number

  @Column({ default: false })
  isPreview: boolean

  @Column({ default: true })
  isActive: boolean

  @Column("simple-array", { nullable: true })
  resources: string[]

  @Column("uuid")
  courseId: string

  @ManyToOne(
    () => Course,
    (course) => course.lessons,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "courseId" })
  course: Course

  @OneToMany(
    () => VideoTutorial,
    (video) => video.lesson,
    { cascade: true },
  )
  videos: VideoTutorial[]

  @OneToMany(
    () => Exercise,
    (exercise) => exercise.lesson,
    { cascade: true },
  )
  exercises: Exercise[]

  @OneToMany(
    () => Assignment,
    (assignment) => assignment.lesson,
    { cascade: true },
  )
  assignments: Assignment[]

  @OneToMany(
    () => LessonCompletion,
    (completion) => completion.lesson,
  )
  completions: LessonCompletion[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
