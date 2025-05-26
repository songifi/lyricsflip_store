import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from "@nestjs/common"
import type { ProgressService } from "../services/progress.service"
import type { UpdateProgressDto } from "../dto/update-progress.dto"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"
import { Roles } from "../../auth/decorators/roles.decorator"
import { UserRole } from "../../users/entities/user.entity"

@Controller("education/progress")
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post("enroll/:courseId")
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  enroll(@Param('courseId') courseId: string, @Request() req) {
    return this.progressService.enrollStudent(req.user.id, courseId)
  }

  @Get("course/:courseId")
  getProgress(@Param('courseId') courseId: string, @Request() req) {
    return this.progressService.getStudentProgress(req.user.id, courseId)
  }

  @Patch("course/:courseId")
  updateProgress(@Param('courseId') courseId: string, @Body() updateDto: UpdateProgressDto, @Request() req) {
    return this.progressService.updateProgress(req.user.id, courseId, updateDto)
  }

  @Post("lesson/:lessonId/complete")
  completeLesson(@Param('lessonId') lessonId: string, @Body() completionData: any, @Request() req) {
    return this.progressService.completeLesson(req.user.id, lessonId, completionData)
  }

  @Get('dashboard')
  getDashboard(@Request() req) {
    return this.progressService.getStudentDashboard(req.user.id);
  }

  @Get("leaderboard")
  getLeaderboard(@Query('courseId') courseId?: string, @Query('limit') limit?: number) {
    return this.progressService.getLeaderboard(courseId, limit)
  }
}
