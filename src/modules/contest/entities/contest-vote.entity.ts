import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Contest } from "./contest.entity"
import { ContestSubmission } from "./contest-submission.entity"

@Entity("contest_votes")
@Index(["contestId", "submissionId", "userId"], { unique: true })
export class ContestVote {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: VoteType,
    default: VoteType.LIKE,
  })
  type: VoteType

  @Column("decimal", { precision: 3, scale: 2, nullable: true })
  rating: number // 1.00 to 5.00 for rating votes

  @Column("boolean", { default: true })
  isPositive: boolean // for like/dislike votes

  @Column("text", { nullable: true })
  comment: string

  @Column("decimal", { precision: 5, scale: 2, default: 1.0 })
  weight: number // for jury votes

  @ManyToOne(
    () => Contest,
    (contest) => contest.votes,
  )
  @JoinColumn({ name: "contestId" })
  contest: Contest

  @Column("uuid")
  contestId: string

  @ManyToOne(
    () => ContestSubmission,
    (submission) => submission.votes,
  )
  @JoinColumn({ name: "submissionId" })
  submission: ContestSubmission

  @Column("uuid")
  submissionId: string

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "userId" })
  user: User

  @Column("uuid")
  userId: string

  @CreateDateColumn()
  createdAt: Date
}
