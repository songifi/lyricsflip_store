import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from "typeorm"

export enum ContentType {
  TRACK = "track",
  ALBUM = "album",
  ARTIST = "artist",
  PLAYLIST = "playlist",
  EVENT = "event",
  MERCHANDISE = "merchandise",
  GENRE = "genre",
}

@Entity("localized_content")
@Index(["entityId", "entityType", "language"], { unique: true })
export class LocalizedContent {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  @Index()
  entityId: string

  @Column({
    type: "enum",
    enum: ContentType,
  })
  @Index()
  entityType: ContentType

  @Column({ type: "varchar", length: 10 })
  @Index()
  language: string

  @Column({ type: "varchar", length: 500, nullable: true })
  title?: string

  @Column({ type: "text", nullable: true })
  description?: string

  @Column({ type: "json", nullable: true })
  metadata?: Record<string, any>

  @Column({ type: "varchar", length: 10, nullable: true })
  region?: string

  @Column({ type: "boolean", default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
