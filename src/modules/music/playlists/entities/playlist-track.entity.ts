import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index, JoinColumn } from "typeorm"
import { Playlist } from "./playlist.entity"
import { Track } from "./track.entity"
import { User } from "./user.entity"

@Entity("playlist_tracks")
@Index(["playlist", "position"])
@Index(["playlist", "track"], { unique: true })
export class PlaylistTrack {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(
    () => Playlist,
    (playlist) => playlist.playlistTracks,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "playlist_id" })
  playlist: Playlist

  @Column({ name: "playlist_id" })
  playlistId: string

  @ManyToOne(() => Track, { onDelete: "CASCADE" })
  @JoinColumn({ name: "track_id" })
  track: Track

  @Column({ name: "track_id" })
  trackId: string

  @Column({ type: "int" })
  position: number

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "added_by" })
  addedBy: User

  @Column({ name: "added_by", nullable: true })
  addedById: string

  @CreateDateColumn()
  addedAt: Date
}
