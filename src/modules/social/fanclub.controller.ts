import { Controller, Post, Body, UseGuards, Request, Param, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FanClubService } from './fanclub.service';
import { CreateFanClubDto } from './dto/create-fanclub.dto';
import { JoinFanClubDto } from './dto/join-fanclub.dto';
import { CreateExclusiveContentDto } from './dto/create-exclusive-content.dto';

@Controller('fanclub')
@UseGuards(JwtAuthGuard)
export class FanClubController {
  constructor(private readonly fanClubService: FanClubService) {}

  @Post()
  async createFanClub(@Request() req, @Body() dto: CreateFanClubDto) {
    return this.fanClubService.createFanClub(req.user, dto);
  }

  @Post('join')
  async joinFanClub(@Request() req, @Body() dto: JoinFanClubDto) {
    return this.fanClubService.joinFanClub(req.user, dto);
  }

  @Post('exclusive-content')
  async createExclusiveContent(@Request() req, @Body() dto: CreateExclusiveContentDto) {
    return this.fanClubService.createExclusiveContent(req.user, dto);
  }

  @Get(':fanClubId/exclusive-content')
  async getExclusiveContent(@Request() req, @Param('fanClubId') fanClubId: string) {
    return this.fanClubService.getFanClubExclusiveContent(req.user, fanClubId);
  }
}
