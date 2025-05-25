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

@Entity("podcast_series")
export class PodcastSeries {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  title: string

  @Column("text", { nullable: true })
  description: string

  @Column({ length: 500, nullable: true })
  coverImageUrl: string

  @Column("int")
  seriesNumber: number

  @Column("uuid")
  podcastId: string

  @ManyToOne(
    () => Podcast,
    (podcast) => podcast.series,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "podcastId" })
  podcast: Podcast

  @OneToMany(
    () => Season,
    (season) => season.series,
  )
  seasons: Season[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
