import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { User } from "../../users/entities/user.entity"
import { ModerationCase } from "./moderation-case.entity"

@Entity("moderation_actions")
export class ModerationAction {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  moderationCaseId: string

  @ManyToOne(
    () => ModerationCase,
    (moderationCase) => moderationCase.actions,
  )
  @JoinColumn({ name: "moderationCaseId" })
  moderationCase: ModerationCase

  @Column({ type: "enum", enum: ActionType })
  actionType: ActionType

  @Column({ type: "text", nullable: true })
  reason: string

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @Column()
  performedByUserId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "performedByUserId" })
  performedBy: User

  @CreateDateColumn()
  createdAt: Date
}
