import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { User } from "../../users/entities/user.entity"

export enum ModerationRole {
  MODERATOR = "moderator",
  SENIOR_MODERATOR = "senior_moderator",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

@Entity("moderation_team_members")
export class ModerationTeamMember {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  userId: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User

  @Column({ type: "enum", enum: ModerationRole })
  role: ModerationRole

  @Column({ type: "simple-array", nullable: true })
  permissions: string[]

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date
}
