import { Controller, Get, Query, Param, UseGuards, ParseUUIDPipe, Res, Header } from "@nestjs/common"
import type { Response } from "express"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import type { AnalyticsDashboardService } from "../services/analytics-dashboard.service"
import type { AnalyticsExportService } from "../services/analytics-export.service"
import type { AnalyticsQueryDto } from "../dto/analytics-query.dto"
import { ArtistDashboardDto } from "../dto/dashboard-response.dto"

@ApiTags("Analytics Dashboard")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("analytics/dashboard")
export class AnalyticsDashboardController {
  constructor(
    private readonly dashboardService: AnalyticsDashboardService,
    private readonly exportService: AnalyticsExportService,
  ) {}

  @Get("artist/:artistId")
  @ApiOperation({ summary: "Get artist dashboard analytics" })
  @ApiResponse({
    status: 200,
    description: "Artist dashboard data",
    type: ArtistDashboardDto,
  })
  async getArtistDashboard(
    @Param('artistId') artistId: string,
    @Query() query: AnalyticsQueryDto,
  ): Promise<ArtistDashboardDto> {
    return this.dashboardService.getArtistDashboard(artistId, query)
  }

  @Get("compare")
  @ApiOperation({ summary: "Compare multiple artists performance" })
  @ApiResponse({ status: 200, description: "Comparative analysis data" })
  async getComparativeAnalysis(@Query('artistIds') artistIds: string, @Query() query: AnalyticsQueryDto) {
    const artistIdArray = artistIds.split(",").filter((id) => id.trim())
    return this.dashboardService.getComparativeAnalysis(artistIdArray, query)
  }

  @Get("export/excel/:artistId")
  @ApiOperation({ summary: "Export artist analytics to Excel" })
  @Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
  async exportToExcel(
    @Param('artistId', ParseUUIDPipe) artistId: string,
    @Query() query: AnalyticsQueryDto,
    @Res() res: Response,
  ) {
    const buffer = await this.exportService.exportToExcel(artistId, query)

    res.setHeader("Content-Disposition", `attachment; filename="artist-analytics-${artistId}-${Date.now()}.xlsx"`)

    res.send(buffer)
  }

  @Get("export/pdf/:artistId")
  @ApiOperation({ summary: "Export artist analytics to PDF" })
  @Header("Content-Type", "application/pdf")
  async exportToPDF(
    @Param('artistId', ParseUUIDPipe) artistId: string,
    @Query() query: AnalyticsQueryDto,
    @Res() res: Response,
  ) {
    const buffer = await this.exportService.exportToPDF(artistId, query)

    res.setHeader("Content-Disposition", `attachment; filename="artist-analytics-${artistId}-${Date.now()}.pdf"`)

    res.send(buffer)
  }

  @Get("export/csv/:artistId")
  @ApiOperation({ summary: "Export artist analytics to CSV" })
  @Header("Content-Type", "text/csv")
  async exportToCSV(
    @Param('artistId', ParseUUIDPipe) artistId: string,
    @Query() query: AnalyticsQueryDto,
    @Res() res: Response,
  ) {
    const csv = await this.exportService.exportToCSV(artistId, query)

    res.setHeader("Content-Disposition", `attachment; filename="artist-analytics-${artistId}-${Date.now()}.csv"`)

    res.send(csv)
  }
}
