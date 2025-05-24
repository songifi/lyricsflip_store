import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn, Index } from "typeorm"
import { Video } from "./video.entity"

@Entity("video_qualities")
@Index(["videoId", "quality"])
export class VideoQuality {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: QualityLevel,
  })
  quality: QualityLevel

  @Column({ name: "file_path" })
  filePath: string

  @Column({ name: "file_url" })
  fileUrl: string

  @Column({ name: "file_size", type: "bigint" })
  fileSize: number

  @Column({ name: "bit_rate", type: "int" })
  bitRate: number

  @Column({ type: "varchar", length: 10 })
  resolution: string

  @Column({ name: "is_ready", type: "boolean", default: false })
  isReady: boolean

  @Column({ name: "video_id" })
  videoId: string

  @ManyToOne(
    () => Video,
    (video) => video.qualities,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "video_id" })
  video: Video

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date
}
