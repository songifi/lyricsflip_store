import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { User } from "../../users/entities/user.entity"
import { ContentType, ViolationType } from "./moderation-case.entity"

@Entity("content_flags")
export class ContentFlag {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "enum", enum: ContentType })
  contentType: ContentType

  @Column()
  contentId: string

  @Column({ type: "enum", enum: ViolationType })
  violationType: ViolationType

  @Column({ type: "text", nullable: true })
  reason: string

  @Column()
  reportedByUserId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "reportedByUserId" })
  reportedBy: User

  @Column({ default: false })
  isProcessed: boolean

  @Column({ nullable: true })
  moderationCaseId: string

  @CreateDateColumn()
  createdAt: Date
}
