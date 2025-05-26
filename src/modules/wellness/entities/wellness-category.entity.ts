import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { WellnessProgram } from "./wellness-program.entity"
import { TherapeuticTrack } from "./therapeutic-track.entity"

@Entity("wellness_categories")
export class WellnessCategory {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  name: string

  @Column({ type: "enum", enum: TherapeuticCategory })
  category: TherapeuticCategory

  @Column("text")
  description: string

  @Column("text", { nullable: true })
  scientificBasis: string

  @Column("simple-array", { nullable: true })
  targetConditions: string[]

  @Column("simple-array", { nullable: true })
  contraindications: string[]

  @Column({ default: true })
  isActive: boolean

  @OneToMany(
    () => WellnessProgram,
    (program) => program.category,
  )
  programs: WellnessProgram[]

  @OneToMany(
    () => TherapeuticTrack,
    (track) => track.category,
  )
  tracks: TherapeuticTrack[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
