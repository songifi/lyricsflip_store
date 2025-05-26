import { Controller, Get, Param, UseGuards, Request } from "@nestjs/common"
import type { AnalyticsService } from "../services/analytics.service"
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard"
import { AdminGuard } from "../../../common/guards/admin.guard"
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger"

@ApiTags("contest-analytics")
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('contests/:id')
  @ApiOperation({ summary: 'Get contest analytics' })
  getContestAnalytics(@Param('id') id: string) {
    return this.analyticsService.getContestAnalytics(id);
  }

  @Get("platform")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get platform analytics" })
  getPlatformAnalytics() {
    return this.analyticsService.getPlatformAnalytics()
  }

  @Get('users/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user contest analytics' })
  getUserAnalytics(@Request() req) {
    return this.analyticsService.getUserContestAnalytics(req.user.id);
  }
}
