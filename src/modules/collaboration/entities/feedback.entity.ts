import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { AudioVersion } from "./audio-version.entity"

export enum FeedbackType {
  COMMENT = "comment",
  SUGGESTION = "suggestion",
  ISSUE = "issue",
  APPROVAL = "approval",
  REJECTION = "rejection",
}

export enum FeedbackStatus {
  PENDING = "pending",
  ACKNOWLEDGED = "acknowledged",
  RESOLVED = "resolved",
  DISMISSED = "dismissed",
}

@Entity("feedback")
@Index(["audioVersionId", "createdAt"])
@Index(["authorId", "createdAt"])
export class Feedback {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "audio_version_id" })
  audioVersionId: string

  @ManyToOne(
    () => AudioVersion,
    (version) => version.feedback,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "audio_version_id" })
  audioVersion: AudioVersion

  @Column({ name: "author_id" })
  authorId: string

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "author_id" })
  author: User

  @Column({
    type: "enum",
    enum: FeedbackType,
    default: FeedbackType.COMMENT,
  })
  type: FeedbackType

  @Column({
    type: "enum",
    enum: FeedbackStatus,
    default: FeedbackStatus.PENDING,
  })
  status: FeedbackStatus

  @Column({ type: "text" })
  content: string

  @Column({ type: "integer", nullable: true })
  timestamp: number // Timestamp in audio file (seconds)

  @Column({ type: "integer", nullable: true })
  rating: number // 1-5 rating

  @Column({ type: "jsonb", nullable: true })
  attachments: {
    id: string
    name: string
    url: string
    type: string
  }[]

  @Column({ name: "parent_feedback_id", nullable: true })
  parentFeedbackId: string

  @ManyToOne(() => Feedback, { nullable: true })
  @JoinColumn({ name: "parent_feedback_id" })
  parentFeedback: Feedback

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
