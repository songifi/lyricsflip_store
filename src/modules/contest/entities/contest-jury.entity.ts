import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm"
import { User } from "../../users/entities/user.entity"
import { Contest } from "./contest.entity"

@Entity("contest_jury")
@Index(["contestId", "userId"], { unique: true })
export class ContestJury {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: JuryStatus,
    default: JuryStatus.INVITED,
  })
  status: JuryStatus

  @Column("decimal", { precision: 5, scale: 2, default: 1.0 })
  votingWeight: number

  @Column("text", { nullable: true })
  expertise: string

  @Column("text", { nullable: true })
  bio: string

  @Column("timestamp", { nullable: true })
  invitedAt: Date

  @Column("timestamp", { nullable: true })
  respondedAt: Date

  @ManyToOne(() => Contest)
  @JoinColumn({ name: "contestId" })
  contest: Contest

  @Column("uuid")
  contestId: string

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "userId" })
  user: User

  @Column("uuid")
  userId: string

  @CreateDateColumn()
  createdAt: Date
}
