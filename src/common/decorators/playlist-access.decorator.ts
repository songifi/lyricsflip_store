import { SetMetadata } from "@nestjs/common"

export enum PlaylistAccessLevel {
  READ = "read",
  WRITE = "write",
  OWNER = "owner",
}

export const PLAYLIST_ACCESS_KEY = "playlist_access"
export const PlaylistAccess = (level: PlaylistAccessLevel) => SetMetadata(PLAYLIST_ACCESS_KEY, level)
