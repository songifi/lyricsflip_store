import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Contest } from "./contest.entity"
import { User } from "../../users/entities/user.entity"

@Entity("contest_prizes")
export class ContestPrize {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("int")
  position: number // 1st, 2nd, 3rd place, etc.

  @Column({ length: 255 })
  title: string

  @Column("text", { nullable: true })
  description: string

  @Column({
    type: "enum",
    enum: PrizeType,
    default: PrizeType.CASH,
  })
  type: PrizeType

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  cashValue: number

  @Column("text", { nullable: true })
  imageUrl: string

  @Column({
    type: "enum",
    enum: PrizeStatus,
    default: PrizeStatus.PENDING,
  })
  status: PrizeStatus

  @Column("timestamp", { nullable: true })
  awardedAt: Date

  @Column("timestamp", { nullable: true })
  claimedAt: Date

  @Column("timestamp", { nullable: true })
  expiresAt: Date

  @Column("jsonb", { nullable: true })
  metadata: Record<string, any>

  @ManyToOne(
    () => Contest,
    (contest) => contest.prizes,
  )
  @JoinColumn({ name: "contestId" })
  contest: Contest

  @Column("uuid")
  contestId: string

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "winnerId" })
  winner: User

  @Column("uuid", { nullable: true })
  winnerId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
