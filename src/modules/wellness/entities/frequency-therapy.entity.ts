import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("frequency_therapies")
export class FrequencyTherapy {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column("text")
  description: string

  @Column({ type: "enum", enum: FrequencyType })
  type: FrequencyType

  @Column("decimal", { precision: 6, scale: 2 })
  frequency: number

  @Column({ type: "enum", enum: BrainwaveState, nullable: true })
  targetBrainwaveState: BrainwaveState

  @Column("simple-array")
  benefits: string[]

  @Column("simple-array")
  targetConditions: string[]

  @Column("text", { nullable: true })
  scientificBasis: string

  @Column("int")
  recommendedDurationMinutes: number

  @Column("simple-array", { nullable: true })
  contraindications: string[]

  @Column("simple-array", { nullable: true })
  usageInstructions: string[]

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
