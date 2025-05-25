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
import { User } from "./user.entity"
import { Episode } from "./episode.entity"
import { PodcastSeries } from "./podcast-series.entity"
import { PodcastSubscription } from "./podcast-subscription.entity"
import { MonetizationPlan } from "./monetization-plan.entity"

export enum PodcastStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export enum PodcastCategory {
  ARTS = "arts",
  BUSINESS = "business",
  COMEDY = "comedy",
  EDUCATION = "education",
  FICTION = "fiction",
  GOVERNMENT = "government",
  HEALTH_FITNESS = "health_fitness",
  HISTORY = "history",
  KIDS_FAMILY = "kids_family",
  LEISURE = "leisure",
  MUSIC = "music",
  NEWS = "news",
  RELIGION_SPIRITUALITY = "religion_spirituality",
  SCIENCE = "science",
  SOCIETY_CULTURE = "society_culture",
  SPORTS = "sports",
  TECHNOLOGY = "technology",
  TRUE_CRIME = "true_crime",
  TV_FILM = "tv_film",
}

@Entity("podcasts")
export class Podcast {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  title: string

  @Column("text")
  description: string

  @Column("text", { nullable: true })
  summary: string

  @Column({ length: 500, nullable: true })
  coverImageUrl: string

  @Column({
    type: "enum",
    enum: PodcastStatus,
    default: PodcastStatus.DRAFT,
  })
  status: PodcastStatus

  @Column({
    type: "enum",
    enum: PodcastCategory,
  })
  category: PodcastCategory

  @Column("simple-array", { nullable: true })
  tags: string[]

  @Column({ length: 255, nullable: true })
  language: string

  @Column({ default: false })
  explicit: boolean

  @Column({ length: 255, nullable: true })
  website: string

  @Column({ length: 255, nullable: true })
  contactEmail: string

  @Column({ length: 255, nullable: true })
  author: string

  @Column({ length: 255, nullable: true })
  copyright: string

  @Column("uuid")
  ownerId: string

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "ownerId" })
  owner: User

  @OneToMany(
    () => Episode,
    (episode) => episode.podcast,
  )
  episodes: Episode[]

  @OneToMany(
    () => PodcastSeries,
    (series) => series.podcast,
  )
  series: PodcastSeries[]

  @OneToMany(
    () => PodcastSubscription,
    (subscription) => subscription.podcast,
  )
  subscriptions: PodcastSubscription[]

  @OneToMany(
    () => MonetizationPlan,
    (plan) => plan.podcast,
  )
  monetizationPlans: MonetizationPlan[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
