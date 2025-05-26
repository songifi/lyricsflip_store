import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { WellnessProgram } from "./wellness-program.entity"

@Entity("meditation_sessions")
export class MeditationSession {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  userId: string

  @Column("uuid")
  programId: string

  @Column("uuid", { nullable: true })
  trackId: string

  @Column("int")
  sessionNumber: number

  @Column("int")
  plannedDurationMinutes: number

  @Column("int", { default: 0 })
  actualDurationMinutes: number

  @Column({ type: "enum", enum: SessionStatus, default: SessionStatus.STARTED })
  status: SessionStatus

  @Column("int", { nullable: true })
  moodBefore: number

  @Column("int", { nullable: true })
  moodAfter: number

  @Column("int", { nullable: true })
  stressBefore: number

  @Column("int", { nullable: true })
  stressAfter: number

  @Column("text", { nullable: true })
  notes: string

  @Column("simple-array", { nullable: true })
  techniques: string[]

  @Column("decimal", { precision: 3, scale: 2, nullable: true })
  completionPercentage: number

  @ManyToOne(
    () => WellnessProgram,
    (program) => program.sessions,
  )
  @JoinColumn({ name: "programId" })
  program: WellnessProgram

  @CreateDateColumn()
  createdAt: Date
}
