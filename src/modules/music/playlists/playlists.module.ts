import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PlaylistsService } from "./playlists.service"
import { SmartPlaylistService } from "./smart-playlist.service"
import { PlaylistAnalyticsService } from "./playlist-analytics.service"
import { PlaylistsController } from "./playlists.controller"
import { Playlist } from "../../../database/entities/playlist.entity"
import { PlaylistTrack } from "../../../database/entities/playlist-track.entity"
import { PlaylistCollaborator } from "../../../database/entities/playlist-collaborator.entity"
import { PlaylistFollow } from "../../../database/entities/playlist-follow.entity"
import { Track } from "../../../database/entities/track.entity"
import { User } from "../../../database/entities/user.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Playlist, PlaylistTrack, PlaylistCollaborator, PlaylistFollow, Track, User])],
  controllers: [PlaylistsController],
  providers: [PlaylistsService, SmartPlaylistService, PlaylistAnalyticsService],
  exports: [PlaylistsService, SmartPlaylistService, PlaylistAnalyticsService],
})
export class PlaylistsModule {}
