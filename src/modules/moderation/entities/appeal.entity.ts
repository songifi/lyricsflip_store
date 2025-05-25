import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { ModerationCase } from "./moderation-case.entity"

@Entity("appeals")
export class Appeal {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  moderationCaseId: string

  @ManyToOne(
    () => ModerationCase,
    (moderationCase) => moderationCase.appeals,
  )
  @JoinColumn({ name: "moderationCaseId" })
  moderationCase: ModerationCase

  @Column({ type: "text" })
  reason: string

  @Column({ type: "text", nullable: true })
  evidence: string

  @Column({ type: "enum", enum: AppealStatus, default: AppealStatus.PENDING })
  status: AppealStatus

  @Column()
  submittedByUserId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "submittedByUserId" })
  submittedBy: User

  @Column({ nullable: true })
  reviewedByUserId: string

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "reviewedByUserId" })
  reviewedBy: User

  @Column({ type: "text", nullable: true })
  reviewNotes: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ nullable: true })
  resolvedAt: Date
}
