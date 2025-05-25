import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChallengeService } from './challenge.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { ParticipateChallengeDto } from './dto/participate-challenge.dto';

@Controller('challenges')
@UseGuards(JwtAuthGuard)
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Post()
  async createChallenge(@Request() req, @Body() dto: CreateChallengeDto) {
    return this.challengeService.createChallenge(req.user, dto);
  }

  @Post('participate')
  async participate(@Request() req, @Body() dto: ParticipateChallengeDto) {
    return this.challengeService.participateInChallenge(req.user, dto);
  }
}
