import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index, JoinColumn } from "typeorm"
import { Video } from "./video.entity"
import { User } from "../../users/entities/user.entity"

@Entity("video_views")
@Index(["videoId", "createdAt"])
@Index(["userId", "videoId"], { unique: true })
@Index(["ipAddress", "videoId"])
export class VideoView {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ name: "video_id" })
  videoId: string

  @ManyToOne(
    () => Video,
    (video) => video.views,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "video_id" })
  video: Video

  @Column({ name: "user_id", nullable: true })
  userId: string

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "user_id" })
  user: User

  @Column({ name: "ip_address", length: 45 })
  ipAddress: string

  @Column({ name: "user_agent", type: "text", nullable: true })
  userAgent: string

  @Column({ name: "watch_duration", type: "int", default: 0 })
  watchDuration: number // seconds watched

  @Column({ name: "completion_percentage", type: "decimal", precision: 5, scale: 2, default: 0 })
  completionPercentage: number

  @Column({ type: "varchar", length: 50, nullable: true })
  country: string

  @Column({ type: "varchar", length: 100, nullable: true })
  city: string

  @Column({ type: "varchar", length: 100, nullable: true })
  device: string

  @Column({ type: "varchar", length: 100, nullable: true })
  browser: string

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date
}
