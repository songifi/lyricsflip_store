import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Course } from "./course.entity"

@Entity("course_certificates")
@Unique(["studentId", "courseId"])
export class CourseCertificate {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  studentId: string

  @Column("uuid")
  courseId: string

  @Column({ length: 255, unique: true })
  certificateNumber: string

  @Column({
    type: "enum",
    enum: CertificateStatus,
    default: CertificateStatus.ISSUED,
  })
  status: CertificateStatus

  @Column()
  issuedDate: Date

  @Column({ nullable: true })
  expiryDate: Date

  @Column("decimal", { precision: 5, scale: 2 })
  finalScore: number

  @Column("decimal", { precision: 5, scale: 2 })
  completionPercentage: number

  @Column({ default: 0 })
  totalTimeSpentHours: number

  @Column("simple-json", { nullable: true })
  achievements: Array<{
    type: string
    title: string
    description: string
    earnedDate: Date
  }>

  @Column("simple-json", { nullable: true })
  skills: Array<{
    skill: string
    level: string
    verified: boolean
  }>

  @Column({ nullable: true })
  certificateUrl: string

  @Column({ nullable: true })
  verificationUrl: string

  @Column("simple-json", { nullable: true })
  metadata: {
    courseVersion: string
    instructorName: string
    courseDuration: number
    completionDate: Date
  }

  @Column({ default: false })
  isPublic: boolean

  @Column({ default: 0 })
  downloadCount: number

  @Column({ default: 0 })
  shareCount: number

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "studentId" })
  student: User

  @ManyToOne(
    () => Course,
    (course) => course.certificates,
    { eager: true },
  )
  @JoinColumn({ name: "courseId" })
  course: Course

  @CreateDateColumn()
  createdAt: Date
}
