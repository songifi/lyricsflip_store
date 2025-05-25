import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index, JoinColumn } from "typeorm"
import { Playlist } from "./playlist.entity"
import { User } from "./user.entity"

export enum CollaboratorRole {
  EDITOR = "editor",
  VIEWER = "viewer",
}

@Entity("playlist_collaborators")
@Index(["playlist", "user"], { unique: true })
export class PlaylistCollaborator {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(
    () => Playlist,
    (playlist) => playlist.collaborators,
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

  @Column({
    type: "enum",
    enum: CollaboratorRole,
    default: CollaboratorRole.EDITOR,
  })
  role: CollaboratorRole

  @ManyToOne(() => User)
  @JoinColumn({ name: "invited_by" })
  invitedBy: User

  @Column({ name: "invited_by" })
  invitedById: string

  @CreateDateColumn()
  invitedAt: Date
}
