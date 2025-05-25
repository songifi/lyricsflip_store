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
import { Track } from "../../music/tracks/entities/track.entity"
import { Artist } from "../../artists/entities/artist.entity"

@Entity("track_analytics")
@Index(["trackId", "date"])
@Index(["artistId", "date"])
export class TrackAnalytics {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  trackId: string

  @ManyToOne(() => Track)
  @JoinColumn({ name: "trackId" })
  track: Track

  @Column("uuid")
  artistId: string

  @ManyToOne(() => Artist)
  @JoinColumn({ name: "artistId" })
  artist: Artist

  @Column("date")
  date: Date

  @Column("bigint", { default: 0 })
  streams: number

  @Column("bigint", { default: 0 })
  uniqueListeners: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  revenue: number

  @Column("int", { default: 0 })
  skipRate: number

  @Column("int", { default: 0 })
  completionRate: number

  @Column("int", { default: 0 })
  averageListenDuration: number // in seconds

  @Column("jsonb", { nullable: true })
  hourlyStreams: {
    hour: number
    streams: number
  }[]

  @Column("jsonb", { nullable: true })
  platformData: {
    platform: string
    streams: number
    revenue: number
  }[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
