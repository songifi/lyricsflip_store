import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { RevenueService, CreateRevenueShareDto, UpdateRevenueShareDto } from './revenue.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RevenueType } from '../../database/entities/revenue-share.entity';

@Controller('bands/:bandId/revenue')
@UseGuards(JwtAuthGuard)
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Post('shares')
  async createRevenueShare(
    @Param('bandId') bandId: string,
    @Body() createRevenueShareDto: CreateRevenueShareDto,
    @Request() req,
  ) {
    return this.revenueService.createRevenueShare(bandId, createRevenueShareDto, req.user.id);
  }

  @Get('shares')
  async getBandRevenueShares(@Param('bandId') bandId: string) {
    return this.revenueService.findByBand(bandId);
  }

  @Get('shares/member/:memberId')
  async getMemberRevenueShares(
    @Param('bandId') bandId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.revenueService.findByMember(bandId, memberId);
  }

  @Patch('shares/:shareId')
  async updateRevenueShare(
    @Param('shareId') shareId: string,
    @Body() updateRevenueShareDto: UpdateRevenueShareDto,
    @Request() req,
  ) {
    return this.revenueService.updateRevenueShare(shareId, updateRevenueShareDto, req.user.id);
  }

  @Delete('shares/:shareId')
  async deleteRevenueShare(@Param('shareId') shareId: string, @Request() req) {
    await this.revenueService.deleteRevenueShare(shareId, req.user.id);
    return { message: 'Revenue share deleted successfully' };
  }

  @Get('distribution/:revenueType')
  async getRevenueDistribution(
    @Param('bandId') bandId: string,
    @Param('revenueType') revenueType: RevenueType,
  ) {
    return this.revenueService.getRevenueDistribution(bandId, revenueType);
  }

  @Get('overview')
  async getBandRevenueOverview(@Param('bandId') bandId: string) {
    return this.revenueService.getBandRevenueOverview(bandId);
  }

  @Post('calculate')
  async calculateMemberRevenue(
    @Param('bandId') bandId: string,
    @Body() body: {
      memberId: string;
      revenueType: RevenueType;
      totalRevenue: number;
    },
  ) {
    const memberRevenue = await this.revenueService.calculateMemberRevenue(
      bandId,
      body.memberId,
      body.revenueType,
      body.totalRevenue,
    );
    return { memberRevenue };
  }
}