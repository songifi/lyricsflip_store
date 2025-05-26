import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { WellnessCategory } from "./wellness-category.entity"

@Entity("therapeutic_tracks")
export class TherapeuticTrack {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  trackId: string // Reference to existing track entity

  @Column("uuid")
  categoryId: string

  @Column({ type: "enum", enum: TherapeuticIntent })
  therapeuticIntent: TherapeuticIntent

  @Column("simple-array")
  targetMoods: string[]

  @Column("simple-array")
  targetEnergyLevels: string[]

  @Column("simple-array")
  targetStressLevels: string[]

  @Column("decimal", { precision: 3, scale: 1, nullable: true })
  binauralFrequency: number

  @Column("decimal", { precision: 3, scale: 1, nullable: true })
  carrierFrequency: number

  @Column("int", { nullable: true })
  recommendedBpm: number

  @Column("simple-array", { nullable: true })
  keySignatures: string[]

  @Column("text", { nullable: true })
  therapeuticNotes: string

  @Column("simple-array", { nullable: true })
  contraindications: string[]

  @Column({ default: true })
  isActive: boolean

  @ManyToOne(
    () => WellnessCategory,
    (category) => category.tracks,
  )
  @JoinColumn({ name: "categoryId" })
  category: WellnessCategory

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
