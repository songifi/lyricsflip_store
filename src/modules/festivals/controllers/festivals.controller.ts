import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from "@nestjs/common"
import type { FestivalsService } from "./festivals.service"
import type { ScheduleService } from "./schedule.service"
import type { VendorsService } from "./vendors.service"
import type { SponsorsService } from "./sponsors.service"
import type { FestivalMapService } from "./festival-map.service"
import type { AttendeeExperienceService } from "./attendee-experience.service"
import type { FestivalAnalyticsService } from "./festival-analytics.service"
import type { CreateFestivalDto } from "./dto/create-festival.dto"
import type { UpdateFestivalDto } from "./dto/update-festival.dto"
import type { CreatePerformanceDto } from "./dto/create-performance.dto"
import type { FestivalStatus } from "../../database/entities/festival.entity"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@Controller("festivals")
@UseGuards(JwtAuthGuard)
export class FestivalsController {
  constructor(
    private readonly festivalsService: FestivalsService,
    private readonly scheduleService: ScheduleService,
    private readonly vendorsService: VendorsService,
    private readonly sponsorsService: SponsorsService,
    private readonly festivalMapService: FestivalMapService,
    private readonly attendeeExperienceService: AttendeeExperienceService,
    private readonly analyticsService: FestivalAnalyticsService,
  ) {}

  @Post()
  create(@Body() createFestivalDto: CreateFestivalDto) {
    return this.festivalsService.create(createFestivalDto);
  }

  @Get()
  findAll(
    @Query('status') status?: FestivalStatus,
    @Query('location') location?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters = {
      status,
      location,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    }
    return this.festivalsService.findAll(filters)
  }

  @Get("upcoming")
  getUpcoming() {
    return this.festivalsService.getUpcomingFestivals()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.festivalsService.findOne(id);
  }

  @Patch(":id")
  update(@Param('id') id: string, @Body() updateFestivalDto: UpdateFestivalDto) {
    return this.festivalsService.update(id, updateFestivalDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.festivalsService.remove(id);
  }

  @Patch(":id/status")
  updateStatus(@Param('id') id: string, @Body('status') status: FestivalStatus) {
    return this.festivalsService.updateStatus(id, status)
  }

  @Get(':id/statistics')
  getStatistics(@Param('id') id: string) {
    return this.festivalsService.getFestivalStatistics(id);
  }

  // Schedule Management
  @Post(":id/performances")
  createPerformance(@Param('id') festivalId: string, @Body() createPerformanceDto: CreatePerformanceDto) {
    return this.scheduleService.createPerformance(createPerformanceDto)
  }

  @Get(':id/schedule')
  getSchedule(@Param('id') festivalId: string) {
    return this.scheduleService.getFestivalSchedule(festivalId);
  }

  @Get(':id/schedule/conflicts')
  getScheduleConflicts(@Param('id') festivalId: string) {
    return this.scheduleService.checkScheduleConflicts(festivalId);
  }

  // Vendor Management
  @Get(':id/vendors')
  getVendors(@Param('id') festivalId: string) {
    return this.vendorsService.getFestivalVendors(festivalId);
  }

  // Sponsor Management
  @Get(':id/sponsors')
  getSponsors(@Param('id') festivalId: string) {
    return this.sponsorsService.getFestivalSponsors(festivalId);
  }

  // Map and Navigation
  @Get(':id/map')
  getFestivalMap(@Param('id') festivalId: string) {
    return this.festivalMapService.getFestivalMap(festivalId);
  }

  // Attendee Experience
  @Get(":id/attendees/:userId/schedule")
  getAttendeeSchedule(@Param('id') festivalId: string, @Param('userId') userId: string) {
    return this.attendeeExperienceService.getPersonalSchedule(festivalId, userId)
  }

  // Analytics
  @Get(':id/analytics')
  getAnalytics(@Param('id') festivalId: string) {
    return this.analyticsService.getFestivalAnalytics(festivalId);
  }
}
