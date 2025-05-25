import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index, JoinColumn } from "typeorm"
import { Playlist } from "./playlist.entity"
import { User } from "./user.entity"

@Entity("playlist_follows")
@Index(["playlist", "user"], { unique: true })
export class PlaylistFollow {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(
    () => Playlist,
    (playlist) => playlist.followers,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "playlist_id" })
  playlist: Playlist

  @Column({ name: "playlist_id" })
  playlistId: string

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User

  @Column({ name: "user_id" })
  userId: string

  @CreateDateColumn()
  followedAt: Date
}
