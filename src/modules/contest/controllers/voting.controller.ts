import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from "@nestjs/common"
import type { VotingService } from "../services/voting.service"
import type { VoteDto } from "../dto/vote.dto"
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard"
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger"

@ApiTags("contest-voting")
@Controller("submissions/:submissionId/votes")
export class VotingController {
  constructor(private readonly votingService: VotingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Vote for submission" })
  vote(@Param('submissionId') submissionId: string, @Body() voteDto: VoteDto, @Request() req) {
    return this.votingService.vote(submissionId, req.user.id, voteDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get submission votes' })
  getVotes(@Param('submissionId') submissionId: string) {
    return this.votingService.getVotes(submissionId);
  }

  @Get("my-vote")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user vote for submission" })
  getMyVote(@Param('submissionId') submissionId: string, @Request() req) {
    return this.votingService.getUserVote(submissionId, req.user.id)
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Remove vote" })
  removeVote(@Param('submissionId') submissionId: string, @Request() req) {
    return this.votingService.removeVote(submissionId, req.user.id)
  }
}
