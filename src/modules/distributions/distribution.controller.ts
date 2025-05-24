import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DistributionService } from './distribution.service';
import { CreateDistributionReleaseDto } from './dto/create-distribution-release.dto';
import { UpdateDistributionStatusDto } from './dto/update-distribution-status.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('distribution')
// @UseGuards(JwtAuthGuard)
export class DistributionController {
  constructor(private readonly distributionService: DistributionService) {}

  @Post('releases')
  async createRelease(@Body() createReleaseDto: CreateDistributionReleaseDto) {
    return this.distributionService.createRelease(createReleaseDto);
  }

  @Get('releases')
  async getReleases(
    @Query('artistId') artistId?: string,
    @Query('platform') platform?: string,
    @Query('status') status?: string,
  ) {
    return this.distributionService.getReleases(artistId, platform, status);
  }

  @Get('releases/:id')
  async getRelease(@Param('id') id: string) {
    return this.distributionService.getRelease(id);
  }

  @Put('releases/:id/status')
  async updateReleaseStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateDistributionStatusDto,
  ) {
    return this.distributionService.updateReleaseStatus(id, updateStatusDto);
  }

  @Post('releases/:id/schedule')
  async scheduleRelease(
    @Param('id') id: string,
    @Body('scheduledDate') scheduledDate: string,
  ) {
    return this.distributionService.scheduleRelease(id, new Date(scheduledDate));
  }

  @Delete('releases/:id/schedule')
  async cancelScheduledRelease(@Param('id') id: string) {
    return this.distributionService.cancelScheduledRelease(id);
  }

  @Get('releases/:id/status-history')
  async getStatusHistory(@Param('id') id: string) {
    return this.distributionService.getStatusHistory(id);
  }

  @Get('releases/:id/analytics')
  async getReleaseAnalytics(
    @Param('id') id: string,
    @Query('platform') platform?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.distributionService.getReleaseAnalytics(
      id,
      platform,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('partners')
  async getDistributionPartners() {
    return this.distributionService.getDistributionPartners();
  }

  @Get('analytics/summary')
  async getAnalyticsSummary(@Query('artistId') artistId?: string) {
    return this.distributionService.getAnalyticsSummary(artistId);
  }

  @Post('releases/:id/sync-metadata')
  async syncMetadata(
    @Param('id') id: string,
    @Query('platform') platform?: string,
  ) {
    return this.distributionService.syncMetadata(id, platform);
  }

  @Get('releases/:id/metadata-status')
  async getMetadataStatus(@Param('id') id: string) {
    return this.distributionService.getMetadataStatus(id);
  }

  @Get('errors')
  async getDistributionErrors(
    @Query('releaseId') releaseId?: string,
    @Query('platform') platform?: string,
    @Query('resolved') resolved?: boolean,
  ) {
    return this.distributionService.getDistributionErrors(releaseId, platform, resolved);
  }

  @Put('errors/:id/resolve')
  async resolveError(
    @Param('id') id: string,
    @Body('resolution') resolution: string,
  ) {
    return this.distributionService.resolveError(id, resolution);
  }
}
