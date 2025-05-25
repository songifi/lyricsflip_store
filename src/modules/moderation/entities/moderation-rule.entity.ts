import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { ContentType, ViolationType } from "./moderation-case.entity"

@Entity("moderation_rules")
export class ModerationRule {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column({ type: "text" })
  description: string

  @Column({ type: "enum", enum: ContentType, array: true })
  applicableContentTypes: ContentType[]

  @Column({ type: "enum", enum: ViolationType })
  violationType: ViolationType

  @Column({ type: "jsonb" })
  conditions: Record<string, any>

  @Column({ type: "jsonb" })
  actions: Record<string, any>

  @Column({ default: true })
  isActive: boolean

  @Column({ type: "float", default: 0.8 })
  confidenceThreshold: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
