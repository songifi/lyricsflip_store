import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { ModerationAction } from "./moderation-action.entity"
import { Appeal } from "./appeal.entity"

@Entity("moderation_cases")
export class ModerationCase {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "enum", enum: ContentType })
  contentType: ContentType

  @Column()
  contentId: string

  @Column({ type: "enum", enum: ModerationStatus, default: ModerationStatus.PENDING })
  status: ModerationStatus

  @Column({ type: "enum", enum: Priority, default: Priority.MEDIUM })
  priority: Priority

  @Column({ type: "enum", enum: ViolationType, array: true, default: [] })
  violationTypes: ViolationType[]

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @Column({ type: "jsonb", nullable: true })
  scanResults: Record<string, any>

  @Column({ type: "float", default: 0 })
  confidenceScore: number

  @Column({ default: false })
  isAutomated: boolean

  @Column({ nullable: true })
  reportedByUserId: string

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "reportedByUserId" })
  reportedBy: User

  @Column({ nullable: true })
  assignedToUserId: string

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "assignedToUserId" })
  assignedTo: User

  @OneToMany(
    () => ModerationAction,
    (action) => action.moderationCase,
  )
  actions: ModerationAction[]

  @OneToMany(
    () => Appeal,
    (appeal) => appeal.moderationCase,
  )
  appeals: Appeal[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ nullable: true })
  resolvedAt: Date
}
