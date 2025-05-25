import { Controller, Get, Param, UseGuards, Request } from "@nestjs/common"
import type { AnalyticsService } from "../services/analytics.service"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"
import { Roles } from "../../auth/decorators/roles.decorator"
import { UserRole } from "../../users/entities/user.entity"

@Controller("education/analytics")
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('course/:courseId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  getCourseAnalytics(@Param('courseId') courseId: string) {
    return this.analyticsService.getCourseAnalytics(courseId);
  }

  @Get('instructor')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  getInstructorAnalytics(@Request() req) {
    return this.analyticsService.getInstructorAnalytics(req.user.id);
  }

  @Get("platform")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getPlatformAnalytics() {
    return this.analyticsService.getPlatformAnalytics()
  }
}
