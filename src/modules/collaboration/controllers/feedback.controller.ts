import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import type { FeedbackService } from "../services/feedback.service"
import type { AddFeedbackDto } from "../dto/add-feedback.dto"
import type { Feedback, FeedbackStatus } from "../entities/feedback.entity"

@ApiTags("collaboration/feedback")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("collaboration/audio-versions/:versionId/feedback")
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: "Add feedback to audio version" })
  @ApiResponse({ status: 201, description: "Feedback added successfully" })
  async addFeedback(
    @Param('versionId') versionId: string,
    @Body() addFeedbackDto: AddFeedbackDto,
    @Request() req,
  ): Promise<Feedback> {
    return this.feedbackService.addFeedback(versionId, req.user.id, addFeedbackDto)
  }

  @Get()
  @ApiOperation({ summary: "Get feedback for audio version" })
  @ApiResponse({ status: 200, description: "Feedback retrieved successfully" })
  async getVersionFeedback(@Request() req, @Param('versionId') versionId: string): Promise<Feedback[]> {
    return this.feedbackService.getVersionFeedback(versionId, req.user.id)
  }

  @Patch(":feedbackId/status")
  @ApiOperation({ summary: "Update feedback status" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  async updateFeedbackStatus(
    @Request() req,
    @Param('feedbackId') feedbackId: string,
    @Body() body: { status: FeedbackStatus },
  ): Promise<Feedback> {
    return this.feedbackService.updateFeedbackStatus(feedbackId, req.user.id, body.status)
  }
}
