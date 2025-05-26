import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

@Entity("wellness_outcomes")
export class WellnessOutcome {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  userId: string

  @Column("uuid", { nullable: true })
  programId: string

  @Column("uuid", { nullable: true })
  sessionId: string

  @Column({ type: "enum", enum: OutcomeType })
  outcomeType: OutcomeType

  @Column("decimal", { precision: 3, scale: 2 })
  beforeScore: number

  @Column("decimal", { precision: 3, scale: 2 })
  afterScore: number

  @Column("decimal", { precision: 3, scale: 2 })
  improvement: number

  @Column("text", { nullable: true })
  notes: string

  @Column("simple-json", { nullable: true })
  metadata: Record<string, any>

  @CreateDateColumn()
  createdAt: Date
}
