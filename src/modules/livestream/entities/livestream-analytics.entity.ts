import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm"
import { LiveStream } from "./livestream.entity"
import { User } from "../../users/entities/user.entity"

@Entity("livestream_analytics")
export class LiveStreamAnalytics {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "timestamp" })
  timestamp: Date

  @Column({ type: "integer", default: 0 })
  viewerCount: number

  @Column({ type: "integer", default: 0 })
  chatMessages: number

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  averageWatchTime: number // in minutes

  @Column({ type: "json", nullable: true })
  qualityMetrics: {
    buffering?: number
    quality?: string
    bitrate?: number
  }

  @Column({ type: "json", nullable: true })
  geographicData: {
    country?: string
    region?: string
    city?: string
  }

  @ManyToOne(
    () => LiveStream,
    (liveStream) => liveStream.analytics,
  )
  @JoinColumn({ name: "liveStreamId" })
  liveStream: LiveStream

  @Column()
  liveStreamId: string

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "userId" })
  user: User

  @Column({ nullable: true })
  userId: string

  @CreateDateColumn()
  createdAt: Date
}
