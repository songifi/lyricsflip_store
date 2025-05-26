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

@Entity("instructor_certifications")
export class InstructorCertification {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  instructorId: string

  @Column({
    type: "enum",
    enum: CertificationType,
    default: CertificationType.BASIC_INSTRUCTOR,
  })
  type: CertificationType

  @Column({
    type: "enum",
    enum: SpecializationArea,
  })
  specialization: SpecializationArea

  @Column({
    type: "enum",
    enum: CertificationStatus,
    default: CertificationStatus.PENDING,
  })
  status: CertificationStatus

  @Column({ length: 255 })
  certificationNumber: string

  @Column()
  issuedDate: Date

  @Column()
  expiryDate: Date

  @Column("uuid", { nullable: true })
  issuedBy: string

  @Column("simple-json", { nullable: true })
  qualifications: Array<{
    type: string
    institution: string
    year: number
    verified: boolean
  }>

  @Column("simple-json", { nullable: true })
  experience: Array<{
    role: string
    organization: string
    years: number
    description: string
  }>

  @Column("simple-json", { nullable: true })
  skills: Array<{
    skill: string
    level: string
    verified: boolean
  }>

  @Column("simple-array", { nullable: true })
  documentUrls: string[]

  @Column("text", { nullable: true })
  notes: string

  @Column("text", { nullable: true })
  rejectionReason: string

  @Column({ default: 0 })
  renewalCount: number

  @Column("decimal", { precision: 3, scale: 2, default: 0 })
  rating: number

  @Column({ default: 0 })
  reviewCount: number

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "instructorId" })
  instructor: User

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "issuedBy" })
  issuer: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
