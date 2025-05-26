import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm"
import { Artist } from "../../artists/entities/artist.entity"
import { Event } from "../../events/entities/event.entity"
import { LiveStreamRecording } from "./livestream-recording.entity"
import { LiveStreamAnalytics } from "./livestream-analytics.entity"
import { LiveStreamPayment } from "./livestream-payment.entity"

export enum StreamStatus {
  SCHEDULED = "scheduled",
  LIVE = "live",
  ENDED = "ended",
  CANCELLED = "cancelled",
}

export enum StreamType {
  CONCERT = "concert",
  STUDIO_SESSION = "studio_session",
  ARTIST_INTERACTION = "artist_interaction",
  REHEARSAL = "rehearsal",
}

export enum StreamQuality {
  LOW = "480p",
  MEDIUM = "720p",
  HIGH = "1080p",
  ULTRA = "4K",
}

@Entity("livestreams")
export class LiveStream {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  title: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({
    type: "enum",
    enum: StreamType,
    default: StreamType.CONCERT,
  })
  type: StreamType

  @Column({
    type: "enum",
    enum: StreamStatus,
    default: StreamStatus.SCHEDULED,
  })
  status: StreamStatus

  @Column({ type: "timestamp" })
  scheduledStartTime: Date

  @Column({ type: "timestamp", nullable: true })
  actualStartTime: Date

  @Column({ type: "timestamp", nullable: true })
  endTime: Date

  @Column({ type: "integer", default: 0 })
  maxViewers: number

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  ticketPrice: number

  @Column({ default: false })
  isPayPerView: boolean

  @Column({ default: true })
  isChatEnabled: boolean

  @Column({ default: true })
  isRecordingEnabled: boolean

  @Column({
    type: "enum",
    enum: StreamQuality,
    default: StreamQuality.HIGH,
  })
  maxQuality: StreamQuality

  @Column({ nullable: true })
  thumbnailUrl: string

  @Column({ nullable: true })
  streamKey: string

  @Column({ nullable: true })
  rtmpUrl: string

  @Column({ nullable: true })
  hlsUrl: string

  @Column({ type: "json", nullable: true })
  streamSettings: {
    bitrate?: number
    fps?: number
    resolution?: string
    audioCodec?: string
    videoCodec?: string
  }

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>

  @ManyToOne(() => Artist, { eager: true })
  @JoinColumn({ name: "artistId" })
  artist: Artist

  @Column()
  artistId: string

  @ManyToOne(() => Event, { nullable: true })
  @JoinColumn({ name: "eventId" })
  event: Event

  @Column({ nullable: true })
  eventId: string

  @OneToMany(
    () => LiveStreamRecording,
    (recording) => recording.liveStream,
  )
  recordings: LiveStreamRecording[]

  @OneToMany(
    () => LiveStreamAnalytics,
    (analytics) => analytics.liveStream,
  )
  analytics: LiveStreamAnalytics[]

  @OneToMany(
    () => LiveStreamPayment,
    (payment) => payment.liveStream,
  )
  payments: LiveStreamPayment[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
