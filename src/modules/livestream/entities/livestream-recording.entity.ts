import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm"
import { LiveStream } from "./livestream.entity"

@Entity("livestream_recordings")
export class LiveStreamRecording {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  filename: string

  @Column()
  fileUrl: string

  @Column({ type: "bigint" })
  fileSize: number

  @Column({ type: "integer" })
  duration: number // in seconds

  @Column({
    type: "enum",
    enum: RecordingStatus,
    default: RecordingStatus.PROCESSING,
  })
  status: RecordingStatus

  @Column({ type: "timestamp" })
  recordingStartTime: Date

  @Column({ type: "timestamp" })
  recordingEndTime: Date

  @Column({ type: "json", nullable: true })
  metadata: {
    resolution?: string
    bitrate?: number
    format?: string
    codec?: string
  }

  @ManyToOne(
    () => LiveStream,
    (liveStream) => liveStream.recordings,
  )
  @JoinColumn({ name: "liveStreamId" })
  liveStream: LiveStream

  @Column()
  liveStreamId: string

  @CreateDateColumn()
  createdAt: Date
}
