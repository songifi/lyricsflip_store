import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinColumn, JoinTable, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { User } from 'src/modules/users/entities/user.entity';
import { Album } from "../../albums/entities/album.entity";
import { Genre } from "../../genres/entities/genre.entity";
import { AudioFormat } from "../enums/audioFormat.enum";
import { TrackStatus } from "../enums/trackStatus.enum";

@Entity("tracks")
@Index(["artistId", "status"])
@Index(["albumId"])
@Index(["isrc"], { unique: true, where: "isrc IS NOT NULL" })
export class Track {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ name: "artist_id" })
  artistId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "artist_id" })
  artist: User;

  @Column({ name: "album_id", nullable: true })
  albumId: string;

  @ManyToOne(() => Album, { onDelete: "SET NULL" })
  @JoinColumn({ name: "album_id" })
  album: Album;

  @Column({ name: "genre_id", nullable: true })
  genreId: string;

  @ManyToOne(() => Genre, { onDelete: "SET NULL" })
  @JoinColumn({ name: "genre_id" })
  genre: Genre;

  @ManyToMany(() => Genre, (genre) => genre.tracks)
  @JoinTable({
    name: "track_genres",
    joinColumn: { name: "track_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "genre_id", referencedColumnName: "id" },
  })
  genres: Genre[];

  @Column({ name: "audio_file_url" })
  audioFileUrl: string;

  @Column({ name: "audio_file_key" })
  audioFileKey: string;

  @Column({ name: "preview_url", nullable: true })
  previewUrl: string;

  @Column({ name: "preview_key", nullable: true })
  previewKey: string;

  @Column({ name: "waveform_url", nullable: true })
  waveformUrl: string;

  @Column({ type: "int" })
  duration: number;

  @Column({ type: "int", nullable: true })
  bitrate: number;

  @Column({ type: "int", nullable: true })
  sampleRate: number;

  @Column({ type: "enum", enum: AudioFormat, default: AudioFormat.MP3 })
  format: AudioFormat;

  @Column({ type: "bigint" })
  fileSize: number;

  @Column({ length: 32, nullable: true })
  checksum: string;

  @Column({ length: 12, nullable: true, unique: true })
  isrc: string;

  @Column({ length: 255, nullable: true })
  upc: string;

  @Column({ type: "int", nullable: true })
  trackNumber: number;

  @Column({ type: "int", nullable: true })
  discNumber: number;

  @Column({ type: "text", nullable: true })
  lyrics: string;

  @Column({ type: "json", nullable: true })
  credits: {
    composers?: string[];
    lyricists?: string[];
    producers?: string[];
    engineers?: string[];
    performers?: string[];
    [key: string]: string[] | undefined;
  };

  @Column({ type: "date", nullable: true })
  releaseDate: Date;

  @Column({ length: 255, nullable: true })
  label: string;

  @Column({ length: 255, nullable: true })
  publisher: string;

  @Column({ type: "json", nullable: true })
  copyrightInfo: {
    owner: string;
    year: number;
    notice?: string;
  };

  @Column({ type: "bigint", default: 0 })
  playCount: number;

  @Column({ type: "bigint", default: 0 })
  downloadCount: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  revenue: number;

  @Column({ type: "enum", enum: TrackStatus, default: TrackStatus.DRAFT })
  status: TrackStatus;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column({ type: "boolean", default: false })
  isExplicit: boolean;

  @Column({ type: "boolean", default: true })
  allowDownload: boolean;

  @Column({ type: "boolean", default: true })
  allowStreaming: boolean;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ length: 3, default: "USD" })
  currency: string;

  @Column({ type: "json", nullable: true })
  processingStatus: {
    audioProcessed: boolean;
    previewGenerated: boolean;
    waveformGenerated: boolean;
    metadataExtracted: boolean;
    errors?: string[];
  };

  @OneToMany(() => Video, (video) => video.track)
  videos: Video[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
