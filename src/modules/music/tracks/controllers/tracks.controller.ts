import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpStatus,
  UseGuards,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiParam, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { TracksService } from "../providers/tracks.service";
import { Roles } from "src/common/decorators/roles.decorator";
import { CreateTrackDto } from "../dto/create-track.dto";
import { Track } from "../entities/track.entity";
import { TrackQueryDto } from "../dto/track-query.dto";
import { Role } from "src/common/enums/role.enum";
import { UpdateTrackDto } from "../dto/update-track.dto";
import { TrackStatus } from "../enums/trackStatus.enum";

@ApiTags("tracks")
@Controller("tracks")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Post()
  @ApiOperation({ summary: "Create a new track with audio file" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Track created successfully",
    type: Track,
  })
  @UseInterceptors(FileInterceptor("audioFile"))
  @Roles(Role.USER, Role.ADMIN)
  async create(@Body() createTrackDto: CreateTrackDto, @UploadedFile() audioFile: Express.Multer.File): Promise<Track> {
    return this.tracksService.create(createTrackDto, audioFile)
  }

  @Get()
  @ApiOperation({ summary: 'Get all tracks with filtering and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tracks retrieved successfully',
  })
  async findAll(@Query() query: TrackQueryDto) {
    return this.tracksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a track by ID' })
  @ApiParam({ name: 'id', description: 'Track UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Track retrieved successfully',
    type: Track,
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Track> {
    return this.tracksService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a track" })
  @ApiParam({ name: "id", description: "Track UUID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Track updated successfully",
    type: Track,
  })
  @Roles(Role.USER, Role.ADMIN)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateTrackDto: UpdateTrackDto): Promise<Track> {
    return this.tracksService.update(id, updateTrackDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a track' })
  @ApiParam({ name: 'id', description: 'Track UUID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Track deleted successfully',
  })
  @Roles(Role.USER, Role.ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.tracksService.remove(id);
  }

  @Post(':id/play')
  @ApiOperation({ summary: 'Increment play count for a track' })
  @ApiParam({ name: 'id', description: 'Track UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Play count incremented successfully',
  })
  async incrementPlayCount(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.tracksService.incrementPlayCount(id);
  }

  @Post(':id/download')
  @ApiOperation({ summary: 'Increment download count for a track' })
  @ApiParam({ name: 'id', description: 'Track UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Download count incremented successfully',
  })
  async incrementDownloadCount(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.tracksService.incrementDownloadCount(id);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update track status" })
  @ApiParam({ name: "id", description: "Track UUID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Track status updated successfully",
    type: Track,
  })
  @Roles(Role.USER, Role.ADMIN)
  async updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body('status') status: TrackStatus): Promise<Track> {
    return this.tracksService.updateStatus(id, status)
  }

  @Post(':id/preview')
  @ApiOperation({ summary: 'Generate preview for a track' })
  @ApiParam({ name: 'id', description: 'Track UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Preview generated successfully',
    type: Track,
  })
  @Roles(Role.USER, Role.ADMIN)
  async generatePreview(@Param('id', ParseUUIDPipe) id: string): Promise<Track> {
    return this.tracksService.generatePreview(id);
  }

  @Post(':id/waveform')
  @ApiOperation({ summary: 'Generate waveform for a track' })
  @ApiParam({ name: 'id', description: 'Track UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Waveform generated successfully',
    type: Track,
  })
  @Roles(Role.USER, Role.ADMIN)
  async generateWaveform(@Param('id', ParseUUIDPipe) id: string): Promise<Track> {
    return this.tracksService.generateWaveform(id);
  }
}
