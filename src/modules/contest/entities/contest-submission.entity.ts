import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Track } from "../../music/tracks/entities/track.entity"
import { Contest } from "./contest.entity"
import { ContestVote } from "./contest-vote.entity"

@Entity("contest_submissions")
@Index(["contestId", "userId"], { unique: true })
export class ContestSubmission {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255, nullable: true })
  title: string

  @Column("text", { nullable: true })
  description: string

  @Column({
    type: "enum",
    enum: SubmissionStatus,
    default: SubmissionStatus.PENDING,
  })
  status: SubmissionStatus

  @Column("int", { default: 0 })
  voteCount: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  averageRating: number

  @Column("int", { default: 0 })
  rank: number

  @Column("boolean", { default: false })
  isWinner: boolean

  @Column("int", { nullable: true })
  prizePosition: number

  @Column("text", { nullable: true })
  rejectionReason: string

  @Column("jsonb", { nullable: true })
  metadata: Record<string, any>

  @ManyToOne(
    () => Contest,
    (contest) => contest.submissions,
  )
  @JoinColumn({ name: "contestId" })
  contest: Contest

  @Column("uuid")
  contestId: string

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "userId" })
  user: User

  @Column("uuid")
  userId: string

  @ManyToOne(() => Track, { eager: true })
  @JoinColumn({ name: "trackId" })
  track: Track

  @Column("uuid")
  trackId: string

  @OneToMany(
    () => ContestVote,
    (vote) => vote.submission,
  )
  votes: ContestVote[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
