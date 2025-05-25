import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("culture_preferences")
@Index(["userId"], { unique: true })
export class CulturePreference {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  @Index()
  userId: string

  @Column({ type: "varchar", length: 10 })
  preferredLanguage: string

  @Column({ type: "varchar", length: 10 })
  region: string

  @Column({ type: "varchar", length: 10 })
  currency: string

  @Column({ type: "varchar", length: 50 })
  timezone: string

  @Column({ type: "json", nullable: true })
  genrePreferences?: string[]

  @Column({ type: "json", nullable: true })
  culturalTags?: string[]

  @Column({ type: "boolean", default: true })
  explicitContent: boolean

  @Column({ type: "varchar", length: 20, nullable: true })
  dateFormat?: string

  @Column({ type: "varchar", length: 20, nullable: true })
  timeFormat?: string

  @Column({ type: "varchar", length: 10, nullable: true })
  numberFormat?: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
