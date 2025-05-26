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
import { User } from "../../users/entities/user.entity"
import { Lesson } from "./lesson.entity"
import { StudentProgress } from "./student-progress.entity"
import { CourseCertificate } from "./course-certificate.entity"

@Entity("courses")
export class Course {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  title: string

  @Column("text")
  description: string

  @Column("text", { nullable: true })
  shortDescription: string

  @Column({ nullable: true })
  thumbnailUrl: string

  @Column({ nullable: true })
  previewVideoUrl: string

  @Column({
    type: "enum",
    enum: CourseLevel,
    default: CourseLevel.BEGINNER,
  })
  level: CourseLevel

  @Column({
    type: "enum",
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status: CourseStatus

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  price: number

  @Column({ default: 0 })
  estimatedDurationMinutes: number

  @Column("simple-array", { nullable: true })
  tags: string[]

  @Column("simple-array", { nullable: true })
  prerequisites: string[]

  @Column("simple-array", { nullable: true })
  learningObjectives: string[]

  @Column({ default: 0 })
  enrollmentCount: number

  @Column("decimal", { precision: 3, scale: 2, default: 0 })
  averageRating: number

  @Column({ default: 0 })
  reviewCount: number

  @Column({ default: true })
  isActive: boolean

  @Column("uuid")
  instructorId: string

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "instructorId" })
  instructor: User

  @OneToMany(
    () => Lesson,
    (lesson) => lesson.course,
    { cascade: true },
  )
  lessons: Lesson[]

  @OneToMany(
    () => StudentProgress,
    (progress) => progress.course,
  )
  studentProgress: StudentProgress[]

  @OneToMany(
    () => CourseCertificate,
    (certificate) => certificate.course,
  )
  certificates: CourseCertificate[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
