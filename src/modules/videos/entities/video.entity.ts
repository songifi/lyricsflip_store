import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from "typeorm"
import { Track } from "../../music/tracks/entities/track.entity"
import { Artist } from "../../artists/entities/artist.entity"
import { User } from "../../users/entities/user.entity"
import { VideoView } from "./video-view.entity"
import { VideoQuality } from "./video-quality.entity"


@Entity("videos")
@Index(["status", "createdAt"])
@Index(["artistId", "status"])
@Index(["trackId"])
export class Video {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  title: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({
    type: "enum",
    enum: VideoType,
    default: VideoType.MUSIC_VIDEO,
  })
  type: VideoType

  @Column({
    type: "enum",
    enum: VideoStatus,
    default: VideoStatus.UPLOADING,
  })
  status: VideoStatus

  // File paths and URLs
  @Column({ name: "original_file_path", nullable: true })
  originalFilePath: string

  @Column({ name: "thumbnail_url", nullable: true })
  thumbnailUrl: string

  @Column({ name: "poster_url", nullable: true })
  posterUrl: string

  // Video metadata
  @Column({ type: "int", nullable: true })
  duration: number // in seconds

  @Column({ name: "file_size", type: "bigint", nullable: true })
  fileSize: number // in bytes

  @Column({ type: "varchar", length: 10, nullable: true })
  resolution: string // e.g., '1920x1080'

  @Column({ name: "frame_rate", type: "decimal", precision: 5, scale: 2, nullable: true })
  frameRate: number

  @Column({ name: "bit_rate", type: "int", nullable: true })
  bitRate: number

  @Column({ type: "varchar", length: 50, nullable: true })
  codec: string

  // SEO and metadata
  @Column({ name: "seo_title", length: 255, nullable: true })
  seoTitle: string

  @Column({ name: "seo_description", type: "text", nullable: true })
  seoDescription: string

  @Column({ name: "seo_keywords", type: "text", nullable: true })
  seoKeywords: string

  @Column({ type: "simple-array", nullable: true })
  tags: string[]

  // Analytics
  @Column({ name: "view_count", type: "int", default: 0 })
  viewCount: number

  @Column({ name: "like_count", type: "int", default: 0 })
  likeCount: number

  @Column({ name: "share_count", type: "int", default: 0 })
  shareCount: number

  @Column({ name: "comment_count", type: "int", default: 0 })
  commentCount: number

  // Privacy and access
  @Column({ name: "is_public", type: "boolean", default: true })
  isPublic: boolean

  @Column({ name: "is_featured", type: "boolean", default: false })
  isFeatured: boolean

  @Column({ name: "is_premium", type: "boolean", default: false })
  isPremium: boolean

  // Relationships
  @Column({ name: "track_id", nullable: true })
  trackId: string

  @ManyToOne(
    () => Track,
    (track) => track.videos,
    { nullable: true },
  )
  @JoinColumn({ name: "track_id" })
  track: Track

  @Column({ name: "artist_id" })
  artistId: string

  @ManyToOne(
    () => Artist,
    (artist) => artist.videos,
  )
  @JoinColumn({ name: "artist_id" })
  artist: Artist

  @Column({ name: "uploaded_by_id" })
  uploadedById: string

  @ManyToOne(
    () => User,
    (user) => user.uploadedVideos,
  )
  @JoinColumn({ name: "uploaded_by_id" })
  uploadedBy: User

  @OneToMany(
    () => VideoView,
    (view) => view.video,
  )
  views: VideoView[]

  @OneToMany(
    () => VideoQuality,
    (quality) => quality.video,
    { cascade: true },
  )
  qualities: VideoQuality[]

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @Column({ name: "published_at", nullable: true })
  publishedAt: Date
}
