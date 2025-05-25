import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { User } from "./user.entity"
import { Podcast } from "./podcast.entity"
import { Episode } from "./episode.entity"

export enum AnalyticsEventType {
  PLAY = "play",
  PAUSE = "pause",
  COMPLETE = "complete",
  SKIP = "skip",
  DOWNLOAD = "download",
  SHARE = "share",
}

@Entity("podcast_analytics")
export class PodcastAnalytics {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: AnalyticsEventType,
  })
  eventType: AnalyticsEventType

  @Column("int", { nullable: true })
  timestamp: number // position in episode (seconds)

  @Column("int", { nullable: true })
  duration: number // how long they listened (seconds)

  @Column({ length: 45, nullable: true })
  ipAddress: string

  @Column({ length: 500, nullable: true })
  userAgent: string

  @Column({ length: 100, nullable: true })
  country: string

  @Column({ length: 100, nullable: true })
  city: string

  @Column({ length: 100, nullable: true })
  device: string

  @Column({ length: 100, nullable: true })
  platform: string

  @Column("uuid", { nullable: true })
  userId: string

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "userId" })
  user: User

  @Column("uuid")
  podcastId: string

  @ManyToOne(() => Podcast, { onDelete: "CASCADE" })
  @JoinColumn({ name: "podcastId" })
  podcast: Podcast

  @Column("uuid")
  episodeId: string

  @ManyToOne(
    () => Episode,
    (episode) => episode.analytics,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "episodeId" })
  episode: Episode

  @CreateDateColumn()
  createdAt: Date
}
