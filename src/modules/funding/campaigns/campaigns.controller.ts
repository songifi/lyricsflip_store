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
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CampaignStatus } from '../../../database/entities/funding-campaign.entity';

@Controller('funding/campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createCampaignDto: CreateCampaignDto, @Request() req) {
    return this.campaignsService.create(createCampaignDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('artistId') artistId?: string,
    @Query('status') status?: CampaignStatus,
    @Query('type') type?: string,
    @Query('isPublic') isPublic?: string,
  ) {
    const filters = {
      artistId,
      status,
      type,
      isPublic: isPublic ? isPublic === 'true' : undefined,
    };

    return this.campaignsService.findAll(filters);
  }

  @Get('top')
  getTopCampaigns(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.campaignsService.getTopCampaigns(limitNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard)
  getCampaignAnalytics(@Param('id') id: string, @Request() req) {
    return this.campaignsService.getCampaignAnalytics(id, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @Request() req,
  ) {
    return this.campaignsService.update(id, updateCampaignDto, req.user.id);
  }

  @Patch(':id/progress')
  @UseGuards(JwtAuthGuard)
  updateProgress(@Param('id') id: string) {
    return this.campaignsService.updateProgress(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.campaignsService.delete(id, req.user.id);
  }
}