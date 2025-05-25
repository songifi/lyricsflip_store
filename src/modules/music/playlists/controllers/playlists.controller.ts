import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from "@nestjs/common"
import type { PlaylistsService } from "./playlists.service"
import type { CreatePlaylistDto } from "./dto/create-playlist.dto"
import type { UpdatePlaylistDto } from "./dto/update-playlist.dto"
import type { AddTrackDto } from "./dto/add-track.dto"
import type { AddCollaboratorDto } from "./dto/add-collaborator.dto"
import type { PlaylistQueryDto } from "./dto/playlist-query.dto"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { OptionalJwtAuthGuard } from "../../auth/guards/optional-jwt-auth.guard"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"

@ApiTags("playlists")
@Controller("playlists")
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new playlist" })
  @ApiResponse({ status: 201, description: "Playlist created successfully" })
  create(@Body() createPlaylistDto: CreatePlaylistDto, @Request() req) {
    return this.playlistsService.create(createPlaylistDto, req.user.id)
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: "Get all playlists with filtering and pagination" })
  @ApiResponse({ status: 200, description: "Playlists retrieved successfully" })
  findAll(@Query() query: PlaylistQueryDto, @Request() req) {
    return this.playlistsService.findAll(query, req.user?.id)
  }

  @Get("my")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user playlists" })
  @ApiResponse({ status: 200, description: "User playlists retrieved successfully" })
  getUserPlaylists(@Query() query: PlaylistQueryDto, @Request() req) {
    return this.playlistsService.getUserPlaylists(req.user.id, query)
  }

  @Get("followed")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get playlists followed by current user" })
  @ApiResponse({ status: 200, description: "Followed playlists retrieved successfully" })
  getFollowedPlaylists(@Query() query: PlaylistQueryDto, @Request() req) {
    return this.playlistsService.getFollowedPlaylists(req.user.id, query)
  }

  @Get('share/:shareToken')
  @ApiOperation({ summary: 'Get playlist by share token' })
  @ApiResponse({ status: 200, description: 'Playlist retrieved successfully' })
  findByShareToken(@Param('shareToken') shareToken: string) {
    return this.playlistsService.findByShareToken(shareToken);
  }

  @Get(":id")
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: "Get playlist by ID" })
  @ApiResponse({ status: 200, description: "Playlist retrieved successfully" })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.playlistsService.findOne(id, req.user?.id)
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update playlist" })
  @ApiResponse({ status: 200, description: "Playlist updated successfully" })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updatePlaylistDto: UpdatePlaylistDto, @Request() req) {
    return this.playlistsService.update(id, updatePlaylistDto, req.user.id)
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete playlist" })
  @ApiResponse({ status: 200, description: "Playlist deleted successfully" })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.playlistsService.remove(id, req.user.id)
  }

  @Post(":id/tracks")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Add track to playlist" })
  @ApiResponse({ status: 201, description: "Track added successfully" })
  addTrack(@Param('id', ParseUUIDPipe) id: string, @Body() addTrackDto: AddTrackDto, @Request() req) {
    return this.playlistsService.addTrack(id, addTrackDto, req.user.id)
  }

  @Delete(":id/tracks/:trackId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Remove track from playlist" })
  @ApiResponse({ status: 200, description: "Track removed successfully" })
  removeTrack(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('trackId', ParseUUIDPipe) trackId: string,
    @Request() req,
  ) {
    return this.playlistsService.removeTrack(id, trackId, req.user.id)
  }

  @Patch(":id/tracks/reorder")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Reorder tracks in playlist" })
  @ApiResponse({ status: 200, description: "Tracks reordered successfully" })
  reorderTracks(@Param('id', ParseUUIDPipe) id: string, @Body('trackIds') trackIds: string[], @Request() req) {
    return this.playlistsService.reorderTracks(id, trackIds, req.user.id)
  }

  @Post(":id/collaborators")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Add collaborator to playlist" })
  @ApiResponse({ status: 201, description: "Collaborator added successfully" })
  addCollaborator(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addCollaboratorDto: AddCollaboratorDto,
    @Request() req,
  ) {
    return this.playlistsService.addCollaborator(id, addCollaboratorDto, req.user.id)
  }

  @Delete(":id/collaborators/:collaboratorId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Remove collaborator from playlist" })
  @ApiResponse({ status: 200, description: "Collaborator removed successfully" })
  removeCollaborator(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('collaboratorId', ParseUUIDPipe) collaboratorId: string,
    @Request() req,
  ) {
    return this.playlistsService.removeCollaborator(id, collaboratorId, req.user.id)
  }

  @Post(":id/follow")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Follow playlist" })
  @ApiResponse({ status: 201, description: "Playlist followed successfully" })
  followPlaylist(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.playlistsService.followPlaylist(id, req.user.id)
  }

  @Delete(":id/follow")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Unfollow playlist" })
  @ApiResponse({ status: 200, description: "Playlist unfollowed successfully" })
  unfollowPlaylist(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.playlistsService.unfollowPlaylist(id, req.user.id)
  }

  @Post(':id/play')
  @ApiOperation({ summary: 'Increment playlist play count' })
  @ApiResponse({ status: 200, description: 'Play count incremented' })
  incrementPlayCount(@Param('id', ParseUUIDPipe) id: string) {
    return this.playlistsService.incrementPlayCount(id);
  }
}
