import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("therapist_profiles")
export class TherapistProfile {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  userId: string // Reference to user entity

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column()
  title: string

  @Column("text")
  bio: string

  @Column("simple-array")
  specialties: TherapistSpecialty[]

  @Column("simple-array")
  certifications: string[]

  @Column({ type: "enum", enum: CertificationLevel })
  certificationLevel: CertificationLevel

  @Column("int")
  yearsExperience: number

  @Column("simple-array", { nullable: true })
  languages: string[]

  @Column("simple-array", { nullable: true })
  approaches: string[]

  @Column({ nullable: true })
  licenseNumber: string

  @Column({ nullable: true })
  licenseState: string

  @Column("text", { nullable: true })
  education: string

  @Column({ default: false })
  isVerified: boolean

  @Column({ default: true })
  isActive: boolean

  @Column("decimal", { precision: 3, scale: 2, nullable: true })
  rating: number

  @Column("int", { default: 0 })
  totalReviews: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
