import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { User } from "../../users/entities/user.entity"
import { ContestSubmission } from "./contest-submission.entity"
import { ContestVote } from "./contest-vote.entity"
import { ContestPrize } from "./contest-prize.entity"

@Entity("contests")
export class Contest {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  title: string

  @Column("text")
  description: string

  @Column("text", { nullable: true })
  rules: string

  @Column({
    type: "enum",
    enum: ContestType,
    default: ContestType.COMPETITION,
  })
  type: ContestType

  @Column({
    type: "enum",
    enum: ContestStatus,
    default: ContestStatus.DRAFT,
  })
  status: ContestStatus

  @Column({
    type: "enum",
    enum: VotingType,
    default: VotingType.PUBLIC,
  })
  votingType: VotingType

  @Column("timestamp")
  submissionStartDate: Date

  @Column("timestamp")
  submissionEndDate: Date

  @Column("timestamp")
  votingStartDate: Date

  @Column("timestamp")
  votingEndDate: Date

  @Column("timestamp", { nullable: true })
  announcementDate: Date

  @Column("int", { default: 0 })
  maxSubmissions: number

  @Column("int", { default: 1 })
  maxSubmissionsPerUser: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  entryFee: number

  @Column("simple-array", { nullable: true })
  allowedGenres: string[]

  @Column("simple-array", { nullable: true })
  requiredTags: string[]

  @Column("int", { default: 180 })
  maxTrackDuration: number // in seconds

  @Column("int", { default: 10 })
  minTrackDuration: number // in seconds

  @Column("text", { nullable: true })
  coverImageUrl: string

  @Column("text", { nullable: true })
  bannerImageUrl: string

  @Column("boolean", { default: true })
  isPublic: boolean

  @Column("boolean", { default: false })
  isFeatured: boolean

  @Column("int", { default: 0 })
  viewCount: number

  @Column("int", { default: 0 })
  participantCount: number

  @Column("int", { default: 0 })
  totalVotes: number

  @Column("jsonb", { nullable: true })
  metadata: Record<string, any>

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "organizerId" })
  organizer: User

  @Column("uuid")
  organizerId: string

  @OneToMany(
    () => ContestSubmission,
    (submission) => submission.contest,
  )
  submissions: ContestSubmission[]

  @OneToMany(
    () => ContestVote,
    (vote) => vote.contest,
  )
  votes: ContestVote[]

  @OneToMany(
    () => ContestPrize,
    (prize) => prize.contest,
  )
  prizes: ContestPrize[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
