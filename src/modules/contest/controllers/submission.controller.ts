import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from "@nestjs/common"
import type { SubmissionService } from "../services/submission.service"
import type { SubmitEntryDto } from "../dto/submit-entry.dto"
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard"
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger"
import type { SubmissionStatus } from "../entities/contest-submission.entity"

@ApiTags("contest-submissions")
@Controller("contests/:contestId/submissions")
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Submit entry to contest" })
  submit(@Param('contestId') contestId: string, @Body() submitEntryDto: SubmitEntryDto, @Request() req) {
    return this.submissionService.submitEntry(contestId, req.user.id, submitEntryDto)
  }

  @Get()
  @ApiOperation({ summary: "Get contest submissions" })
  getSubmissions(@Param('contestId') contestId: string, @Query('status') status?: SubmissionStatus) {
    return this.submissionService.getSubmissions(contestId, status)
  }

  @Get('my-submissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user submissions' })
  getMySubmissions(@Request() req) {
    return this.submissionService.getUserSubmissions(req.user.id);
  }

  @Delete(":submissionId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Withdraw submission" })
  withdraw(@Param('submissionId') submissionId: string, @Request() req) {
    return this.submissionService.withdrawSubmission(submissionId, req.user.id)
  }
}
