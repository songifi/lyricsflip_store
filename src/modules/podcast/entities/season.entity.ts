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
import { PodcastSeries } from "./podcast-series.entity"
import { Episode } from "./episode.entity"

@Entity("seasons")
export class Season {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  title: string

  @Column("text", { nullable: true })
  description: string

  @Column({ length: 500, nullable: true })
  coverImageUrl: string

  @Column("int")
  seasonNumber: number

  @Column("uuid")
  seriesId: string

  @ManyToOne(
    () => PodcastSeries,
    (series) => series.seasons,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "seriesId" })
  series: PodcastSeries

  @OneToMany(
    () => Episode,
    (episode) => episode.season,
  )
  episodes: Episode[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
