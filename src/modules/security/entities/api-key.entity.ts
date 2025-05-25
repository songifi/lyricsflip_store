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

export enum ApiKeyStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  REVOKED = "revoked",
}

export enum ApiKeyScope {
  READ = "read",
  WRITE = "write",
  STREAM = "stream",
  UPLOAD = "upload",
  ADMIN = "admin",
}

@Entity("api_keys")
export class ApiKey {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  key: string

  @Column()
  name: string

  @Column({ nullable: true })
  description: string

  @Column({
    type: "enum",
    enum: ApiKeyStatus,
    default: ApiKeyStatus.ACTIVE,
  })
  status: ApiKeyStatus

  @Column("simple-array")
  scopes: ApiKeyScope[]

  @Column({ type: "jsonb", nullable: true })
  rateLimits: {
    windowMs: number
    max: number
  }

  @Column({ type: "jsonb", nullable: true })
  allowedIps: string[]

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @Column({ type: "timestamp", nullable: true })
  lastUsedAt: Date

  @Column({ type: "timestamp", nullable: true })
  expiresAt: Date

  @Column({ default: 0 })
  usageCount: number

  @Column({ nullable: true })
  userId: string

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
