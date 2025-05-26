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
import { WellnessCategory } from "./wellness-category.entity"
import { UserWellnessProgress } from "./user-wellness-progress.entity"
import { MeditationSession } from "./meditation-session.entity"

@Entity("wellness_programs")
export class WellnessProgram {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  title: string

  @Column("text")
  description: string

  @Column({ type: "enum", enum: ProgramType })
  type: ProgramType

  @Column({ type: "enum", enum: ProgramDifficulty })
  difficulty: ProgramDifficulty

  @Column("int")
  durationMinutes: number

  @Column("int")
  totalSessions: number

  @Column("simple-array", { nullable: true })
  tags: string[]

  @Column("text", { nullable: true })
  instructions: string

  @Column("simple-array", { nullable: true })
  benefits: string[]

  @Column({ default: true })
  isActive: boolean

  @Column("uuid")
  categoryId: string

  @ManyToOne(
    () => WellnessCategory,
    (category) => category.programs,
  )
  @JoinColumn({ name: "categoryId" })
  category: WellnessCategory

  @OneToMany(
    () => UserWellnessProgress,
    (progress) => progress.program,
  )
  userProgress: UserWellnessProgress[]

  @OneToMany(
    () => MeditationSession,
    (session) => session.program,
  )
  sessions: MeditationSession[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
