import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm"
import { Podcast } from "./podcast.entity"
import { Season } from "./season.entity"
import { Chapter } from "./chapter.entity"
import { PodcastAnalytics } from "./podcast-analytics.entity"

export enum EpisodeStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export enum EpisodeType {
  FULL = "full",
  TRAILER = "trailer",
  BONUS = "bonus",
}

@Entity("episodes")
export class Episode {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  title: string

  @Column("text")
  description: string

  @Column("text", { nullable: true })
  summary: string

  @Column({ length: 500 })
  audioUrl: string

  @Column({ length: 500, nullable: true })
  coverImageUrl: string

  @Column("int")
  duration: number // in seconds

  @Column("bigint")
  fileSize: number // in bytes

  @Column({ length: 100 })
  mimeType: string

  @Column({
    type: "enum",
    enum: EpisodeStatus,
    default: EpisodeStatus.DRAFT,
  })
  status: EpisodeStatus

  @Column({
    type: "enum",
    enum: EpisodeType,
    default: EpisodeType.FULL,
  })
  type: EpisodeType

  @Column("int", { nullable: true })
  episodeNumber: number

  @Column({ default: false })
  explicit: boolean

  @Column("simple-array", { nullable: true })
  tags: string[]

  @Column({ type: "timestamp", nullable: true })
  publishedAt: Date

  @Column({ type: "timestamp", nullable: true })
  scheduledAt: Date

  @Column("text", { nullable: true })
  transcript: string

  @Column("uuid")
  podcastId: string

  @ManyToOne(
    () => Podcast,
    (podcast) => podcast.episodes,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "podcastId" })
  podcast: Podcast

  @Column("uuid", { nullable: true })
  seasonId: string

  @ManyToOne(
    () => Season,
    (season) => season.episodes,
    { nullable: true },
  )
  @JoinColumn({ name: "seasonId" })
  season: Season

  @OneToMany(
    () => Chapter,
    (chapter) => chapter.episode,
  )
  chapters: Chapter[]

  @OneToMany(
    () => PodcastAnalytics,
    (analytics) => analytics.episode,
  )
  analytics: PodcastAnalytics[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
