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
import { Lesson } from "./lesson.entity"
import { AssignmentSubmission } from "./assignment-submission.entity"

@Entity("assignments")
export class Assignment {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  title: string

  @Column("text")
  description: string

  @Column({
    type: "enum",
    enum: AssignmentType,
    default: AssignmentType.COMPOSITION,
  })
  type: AssignmentType

  @Column("text")
  instructions: string

  @Column("simple-json", { nullable: true })
  requirements: Array<{
    type: string
    description: string
    mandatory: boolean
  }>

  @Column("simple-json", { nullable: true })
  rubric: Array<{
    criteria: string
    description: string
    maxPoints: number
  }>

  @Column({ default: 100 })
  maxPoints: number

  @Column({ nullable: true })
  dueDate: Date

  @Column({ default: 0 })
  estimatedHours: number

  @Column("simple-array", { nullable: true })
  allowedFileTypes: string[]

  @Column({ default: 10 }) // MB
  maxFileSize: number

  @Column({ default: true })
  allowLateSubmission: boolean

  @Column({ default: 0 })
  latePenaltyPercentage: number

  @Column("simple-array", { nullable: true })
  resources: string[]

  @Column({ default: 0 })
  orderIndex: number

  @Column("uuid")
  lessonId: string

  @ManyToOne(
    () => Lesson,
    (lesson) => lesson.assignments,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "lessonId" })
  lesson: Lesson

  @OneToMany(
    () => AssignmentSubmission,
    (submission) => submission.assignment,
  )
  submissions: AssignmentSubmission[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
