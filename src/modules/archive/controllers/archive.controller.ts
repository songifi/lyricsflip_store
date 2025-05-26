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
} from '@nestjs/common';
import { ArchiveService } from '../services/archive.service';
import { ArchiveContributionService } from '../services/archive-contribution.service';
import { CreateArchiveDto } from '../dto/create-archive.dto';
import { UpdateArchiveDto } from '../dto/update-archive.dto';
import { SearchArchiveDto } from '../dto/search-archive.dto';
import { CreateContributionDto } from '../dto/create-contribution.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ArchiveStatus } from '../entities/archive.entity';

@Controller('archives')
@UseGuards(JwtAuthGuard)
export class ArchiveController {
  constructor(
    private readonly archiveService: ArchiveService,
    private readonly contributionService: ArchiveContributionService,
  ) {}

  @Post()
  async create(@Body() createArchiveDto: CreateArchiveDto, @Request() req) {
    return await this.archiveService.create(createArchiveDto, req.user.id);
  }

  @Get()
  async findAll(@Query() searchDto: SearchArchiveDto) {
    return await this.archiveService.findAll(searchDto);
  }

  @Get('statistics')
  async getStatistics() {
    return await this.archiveService.getPreservationStatistics();
  }

  @Get('search/metadata')
  async searchByMetadata(@Query() metadata: Record<string, any>) {
    return await this.archiveService.searchByMetadata(metadata);
  }

  @Get('artist/:artistId')
  async getArchivesByArtist(@Param('artistId') artistId: string) {
    return await this.archiveService.getArchivesByArtist(artistId);
  }

  @Get('artist/:artistId/timeline')
  async getArtistTimeline(@Param('artistId') artistId: string) {
    return await this.archiveService.getArchiveTimeline(artistId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.archiveService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateArchiveDto: UpdateArchiveDto) {
    return await this.archiveService.update(id, updateArchiveDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ArchiveStatus,
  ) {
    return await this.archiveService.updateStatus(id, status);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.archiveService.remove(id);
    return { message: 'Archive deleted successfully' };
  }

  // Contribution endpoints
  @Post(':id/contributions')
  async addContribution(
    @Param('id') archiveId: string,
    @Body() createContributionDto: CreateContributionDto,
    @Request() req,
  ) {
    return await this.contributionService.create(
      { ...createContributionDto, archiveId },
      req.user.id,
    );
  }

  @Get(':id/contributions')
  async getContributions(@Param('id') archiveId: string) {
    return await this.contributionService.findByArchive(archiveId);
  }

  @Get('contributions/user/:userId')
  async getUserContributions(@Param('userId') userId: string) {
    return await this.contributionService.findByContributor(userId);
  }

  @Get('contributions/statistics/:userId?')
  async getContributionStatistics(@Param('userId') userId?: string) {
    return await this.contributionService.getContributionStatistics(userId);
  }
}