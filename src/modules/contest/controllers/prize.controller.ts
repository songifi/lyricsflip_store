import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Patch } from "@nestjs/common"
import type { PrizeService } from "../services/prize.service"
import type { CreatePrizeDto } from "../dto/create-prize.dto"
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard"
import { AdminGuard } from "../../../common/guards/admin.guard"
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger"

@ApiTags("contest-prizes")
@Controller("contests/:contestId/prizes")
export class PrizeController {
  constructor(private readonly prizeService: PrizeService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create contest prize" })
  create(@Param('contestId') contestId: string, @Body() createPrizeDto: CreatePrizeDto) {
    return this.prizeService.createPrize(contestId, createPrizeDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get contest prizes' })
  getPrizes(@Param('contestId') contestId: string) {
    return this.prizeService.getPrizes(contestId);
  }

  @Post('award')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Award prizes to winners' })
  awardPrizes(@Param('contestId') contestId: string) {
    return this.prizeService.awardPrizes(contestId);
  }

  @Get('my-prizes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user prizes' })
  getMyPrizes(@Request() req) {
    return this.prizeService.getUserPrizes(req.user.id);
  }

  @Patch(":prizeId/claim")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Claim prize" })
  claimPrize(@Param('prizeId') prizeId: string, @Request() req) {
    return this.prizeService.claimPrize(prizeId, req.user.id)
  }

  @Delete(':prizeId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete prize' })
  deletePrize(@Param('prizeId') prizeId: string) {
    return this.prizeService.deletePrize(prizeId);
  }
}
