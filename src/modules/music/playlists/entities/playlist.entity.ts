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
import { User } from "./user.entity"
import { PlaylistTrack } from "./playlist-track.entity"
import { PlaylistCollaborator } from "./playlist-collaborator.entity"
import { PlaylistFollow } from "./playlist-follow.entity"

export enum PlaylistPrivacy {
  PUBLIC = "public",
  PRIVATE = "private",
  UNLISTED = "unlisted",
}

export enum PlaylistType {
  MANUAL = "manual",
  SMART = "smart",
}

@Entity("playlists")
@Index(["createdBy", "privacy"])
@Index(["privacy", "createdAt"])
export class Playlist {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  name: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ type: "varchar", nullable: true })
  coverImage: string

  @Column({
    type: "enum",
    enum: PlaylistPrivacy,
    default: PlaylistPrivacy.PUBLIC,
  })
  privacy: PlaylistPrivacy

  @Column({
    type: "enum",
    enum: PlaylistType,
    default: PlaylistType.MANUAL,
  })
  type: PlaylistType

  @Column({ type: "jsonb", nullable: true })
  smartCriteria: {
    genres?: string[]
    artists?: string[]
    minDuration?: number
    maxDuration?: number
    minReleaseYear?: number
    maxReleaseYear?: number
    mood?: string[]
    energy?: { min: number; max: number }
    limit?: number
  }

  @Column({ default: false })
  isCollaborative: boolean

  @Column({ default: 0 })
  trackCount: number

  @Column({ default: 0 })
  totalDuration: number // in seconds

  @Column({ default: 0 })
  followersCount: number

  @Column({ default: 0 })
  playsCount: number

  @Column({ type: "varchar", unique: true })
  shareToken: string

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "created_by" })
  createdBy: User

  @Column({ name: "created_by" })
  createdById: string

  @OneToMany(
    () => PlaylistTrack,
    (playlistTrack) => playlistTrack.playlist,
    {
      cascade: true,
    },
  )
  playlistTracks: PlaylistTrack[]

  @OneToMany(
    () => PlaylistCollaborator,
    (collaborator) => collaborator.playlist,
    { cascade: true },
  )
  collaborators: PlaylistCollaborator[]

  @OneToMany(
    () => PlaylistFollow,
    (follow) => follow.playlist,
    {
      cascade: true,
    },
  )
  followers: PlaylistFollow[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
