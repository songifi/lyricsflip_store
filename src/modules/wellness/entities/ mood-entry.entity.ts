import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"

@Entity("mood_entries")
export class MoodEntry {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  userId: string

  @Column({ type: "enum", enum: MoodType })
  mood: MoodType

  @Column({ type: "enum", enum: EnergyLevel })
  energy: EnergyLevel

  @Column({ type: "enum", enum: StressLevel })
  stress: StressLevel

  @Column("simple-array", { nullable: true })
  emotions: string[]

  @Column("text", { nullable: true })
  notes: string

  @Column("simple-array", { nullable: true })
  triggers: string[]

  @Column("simple-array", { nullable: true })
  activities: string[]

  @CreateDateColumn()
  createdAt: Date
}
