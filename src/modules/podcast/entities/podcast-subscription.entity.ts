import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm"
import { User } from "./user.entity"
import { Podcast } from "./podcast.entity"

@Entity("podcast_subscriptions")
@Unique(["userId", "podcastId"])
export class PodcastSubscription {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  userId: string

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User

  @Column("uuid")
  podcastId: string

  @ManyToOne(
    () => Podcast,
    (podcast) => podcast.subscriptions,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "podcastId" })
  podcast: Podcast

  @Column({ default: true })
  notificationsEnabled: boolean

  @Column({ type: "timestamp", nullable: true })
  lastListenedAt: Date

  @CreateDateColumn()
  subscribedAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
