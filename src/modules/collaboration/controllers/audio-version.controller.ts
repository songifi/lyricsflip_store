import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger"
import { FileInterceptor } from "@nestjs/platform-express"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import type { AudioVersionService } from "../services/audio-version.service"
import type { UploadAudioDto } from "../dto/upload-audio.dto"
import type { AudioVersion } from "../entities/audio-version.entity"

@ApiTags("collaboration/audio-versions")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("collaboration/projects/:projectId/audio-versions")
export class AudioVersionController {
  constructor(private readonly audioVersionService: AudioVersionService) {}

  @Post("upload")
  @ApiOperation({ summary: "Upload new audio version" })
  @ApiResponse({ status: 201, description: "Audio uploaded successfully" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("audio"))
  async uploadAudio(
    req: any,
    @Param('projectId') projectId: string,
    @Body() uploadDto: UploadAudioDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AudioVersion> {
    return this.audioVersionService.uploadAudioVersion(projectId, req.user.id, uploadDto, file)
  }

  @Get()
  @ApiOperation({ summary: "Get project audio versions" })
  @ApiResponse({ status: 200, description: "Versions retrieved successfully" })
  async getProjectVersions(@Request() req, @Param('projectId') projectId: string): Promise<AudioVersion[]> {
    return this.audioVersionService.getProjectVersions(projectId, req.user.id)
  }

  @Patch(":versionId/approve")
  @ApiOperation({ summary: "Approve audio version" })
  @ApiResponse({ status: 200, description: "Version approved successfully" })
  async approveVersion(@Request() req, @Param('versionId') versionId: string): Promise<AudioVersion> {
    return this.audioVersionService.approveVersion(versionId, req.user.id)
  }

  @Get(":versionId/history")
  @ApiOperation({ summary: "Get version history" })
  @ApiResponse({ status: 200, description: "History retrieved successfully" })
  async getVersionHistory(@Request() req, @Param('versionId') versionId: string): Promise<AudioVersion[]> {
    return this.audioVersionService.getVersionHistory(versionId, req.user.id)
  }
}
