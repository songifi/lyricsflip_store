import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from "typeorm"

export enum TranslationType {
  MUSIC_METADATA = "music_metadata",
  UI_TEXT = "ui_text",
  GENRE = "genre",
  ARTIST_BIO = "artist_bio",
  ALBUM_DESCRIPTION = "album_description",
  TRACK_TITLE = "track_title",
  PLAYLIST_NAME = "playlist_name",
  EVENT_DESCRIPTION = "event_description",
  MERCHANDISE = "merchandise",
}

@Entity("translations")
@Index(["key", "language", "type"], { unique: true })
export class Translation {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255 })
  @Index()
  key: string

  @Column({ type: "varchar", length: 10 })
  @Index()
  language: string

  @Column({ type: "text" })
  value: string

  @Column({
    type: "enum",
    enum: TranslationType,
    default: TranslationType.UI_TEXT,
  })
  @Index()
  type: TranslationType

  @Column({ type: "varchar", length: 100, nullable: true })
  namespace?: string

  @Column({ type: "json", nullable: true })
  metadata?: Record<string, any>

  @Column({ type: "boolean", default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
