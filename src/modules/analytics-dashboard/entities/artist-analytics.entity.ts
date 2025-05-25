import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { Artist } from "../../artists/entities/artist.entity"

@Entity("artist_analytics")
@Index(["artistId", "date"])
@Index(["date"])
export class ArtistAnalytics {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  artistId: string

  @ManyToOne(() => Artist)
  @JoinColumn({ name: "artistId" })
  artist: Artist

  @Column("date")
  date: Date

  // Streaming metrics
  @Column("bigint", { default: 0 })
  totalStreams: number

  @Column("bigint", { default: 0 })
  uniqueListeners: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  streamingRevenue: number

  @Column("int", { default: 0 })
  skipRate: number // percentage

  @Column("int", { default: 0 })
  completionRate: number // percentage

  // Engagement metrics
  @Column("int", { default: 0 })
  likes: number

  @Column("int", { default: 0 })
  shares: number

  @Column("int", { default: 0 })
  comments: number

  @Column("int", { default: 0 })
  playlistAdds: number

  @Column("int", { default: 0 })
  followers: number

  @Column("int", { default: 0 })
  newFollowers: number

  // Revenue metrics
  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  merchandiseRevenue: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  eventRevenue: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  totalRevenue: number

  // Geographic data (JSON)
  @Column("jsonb", { nullable: true })
  geographicData: {
    country: string
    streams: number
    revenue: number
  }[]

  // Demographic data (JSON)
  @Column("jsonb", { nullable: true })
  demographicData: {
    ageGroup: string
    gender: string
    percentage: number
  }[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
