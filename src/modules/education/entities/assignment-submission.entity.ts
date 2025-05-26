import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Assignment } from "./assignment.entity"

@Entity("assignment_submissions")
export class AssignmentSubmission {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  studentId: string

  @Column("uuid")
  assignmentId: string

  @Column({
    type: "enum",
    enum: SubmissionStatus,
    default: SubmissionStatus.DRAFT,
  })
  status: SubmissionStatus

  @Column("text", { nullable: true })
  content: string

  @Column("simple-array", { nullable: true })
  fileUrls: string[]

  @Column("simple-json", { nullable: true })
  metadata: {
    fileNames: string[]
    fileSizes: number[]
    mimeTypes: string[]
  }

  @Column({ nullable: true })
  submittedAt: Date

  @Column({ nullable: true })
  gradedAt: Date

  @Column("uuid", { nullable: true })
  gradedBy: string

  @Column({ nullable: true })
  score: number

  @Column({ nullable: true })
  maxScore: number

  @Column("decimal", { precision: 5, scale: 2, nullable: true })
  percentage: number

  @Column("text", { nullable: true })
  feedback: string

  @Column("simple-json", { nullable: true })
  rubricScores: Array<{
    criteria: string
    score: number
    maxScore: number
    feedback: string
  }>

  @Column({ default: false })
  isLate: boolean

  @Column({ default: 0 })
  lateDays: number

  @Column({ default: 0 })
  penaltyApplied: number

  @Column({ default: 1 })
  attemptNumber: number

  @Column({ default: 0 })
  timeSpentMinutes: number

  @Column("simple-json", { nullable: true })
  revisionHistory: Array<{
    version: number
    submittedAt: Date
    changes: string
  }>

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "studentId" })
  student: User

  @ManyToOne(
    () => Assignment,
    (assignment) => assignment.submissions,
    { eager: true },
  )
  @JoinColumn({ name: "assignmentId" })
  assignment: Assignment

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "gradedBy" })
  grader: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
