import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common"
import type { Reflector } from "@nestjs/core"
import type { Repository } from "typeorm"
import { type Playlist, PlaylistPrivacy } from "../../database/entities/playlist.entity"
import { type PlaylistCollaborator, CollaboratorRole } from "../../database/entities/playlist-collaborator.entity"
import { PLAYLIST_ACCESS_KEY, PlaylistAccessLevel } from "../decorators/playlist-access.decorator"

@Injectable()
export class PlaylistAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private playlistRepository: Repository<Playlist>,
    private collaboratorRepository: Repository<PlaylistCollaborator>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredAccess = this.reflector.getAllAndOverride<PlaylistAccessLevel>(PLAYLIST_ACCESS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredAccess) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user
    const playlistId = request.params.id

    if (!playlistId) {
      throw new NotFoundException("Playlist ID not provided")
    }

    const playlist = await this.playlistRepository.findOne({
      where: { id: playlistId },
      relations: ["collaborators"],
    })

    if (!playlist) {
      throw new NotFoundException("Playlist not found")
    }

    return this.checkAccess(playlist, user?.id, requiredAccess)
  }

  private async checkAccess(playlist: Playlist, userId: string, requiredAccess: PlaylistAccessLevel): Promise<boolean> {
    // Owner always has full access
    if (playlist.createdById === userId) {
      return true
    }

    // Check if playlist is accessible based on privacy
    if (playlist.privacy === PlaylistPrivacy.PRIVATE && !userId) {
      throw new ForbiddenException("Authentication required for private playlists")
    }

    if (playlist.privacy === PlaylistPrivacy.PUBLIC && requiredAccess === PlaylistAccessLevel.READ) {
      return true
    }

    if (!userId) {
      throw new ForbiddenException("Authentication required")
    }

    // Check collaborator permissions
    const collaborator = playlist.collaborators?.find((c) => c.userId === userId)

    if (!collaborator && playlist.privacy === PlaylistPrivacy.PRIVATE) {
      throw new ForbiddenException("Access denied")
    }

    if (requiredAccess === PlaylistAccessLevel.OWNER) {
      return playlist.createdById === userId
    }

    if (requiredAccess === PlaylistAccessLevel.WRITE) {
      return playlist.createdById === userId || (collaborator && collaborator.role === CollaboratorRole.EDITOR)
    }

    if (requiredAccess === PlaylistAccessLevel.READ) {
      return (
        playlist.privacy === PlaylistPrivacy.PUBLIC ||
        playlist.privacy === PlaylistPrivacy.UNLISTED ||
        playlist.createdById === userId ||
        !!collaborator
      )
    }

    return false
  }
}
