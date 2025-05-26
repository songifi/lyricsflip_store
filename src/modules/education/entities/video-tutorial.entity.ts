import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Lesson } from "./lesson.entity"

@Entity("video_tutorials")
export class VideoTutorial {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  title: string

  @Column("text", { nullable: true })
  description: string

  @Column()
  videoUrl: string

  @Column({ nullable: true })
  thumbnailUrl: string

  @Column({ default: 0 })
  durationSeconds: number

  @Column({
    type: "enum",
    enum: VideoQuality,
    default: VideoQuality.HD,
  })
  quality: VideoQuality

  @Column({
    type: "enum",
    enum: VideoStatus,
    default: VideoStatus.UPLOADING,
  })
  status: VideoStatus

  @Column("bigint", { default: 0 })
  fileSize: number

  @Column({ nullable: true })
  streamingUrl: string

  @Column("simple-json", { nullable: true })
  chapters: Array<{
    title: string
    startTime: number
    endTime: number
  }>

  @Column("simple-json", { nullable: true })
  subtitles: Array<{
    language: string
    url: string
  }>

  @Column({ default: 0 })
  viewCount: number

  @Column({ default: 0 })
  orderIndex: number

  @Column("uuid")
  lessonId: string

  @ManyToOne(
    () => Lesson,
    (lesson) => lesson.videos,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "lessonId" })
  lesson: Lesson

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
