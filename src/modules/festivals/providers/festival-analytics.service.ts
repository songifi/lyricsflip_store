import { Injectable } from "@nestjs/common"
import { type Repository, Between } from "typeorm"
import { type FestivalAnalytics, AnalyticsType } from "../../database/entities/festival-analytics.entity"
import type { Festival } from "../../database/entities/festival.entity"
import type { FestivalAttendee } from "../../database/entities/festival-attendee.entity"
import type { Performance } from "../../database/entities/performance.entity"
import type { Vendor } from "../../database/entities/vendor.entity"
import type { Sponsor } from "../../database/entities/sponsor.entity"
import { Inject } from "@nestjs/common"

@Injectable()
export class FestivalAnalyticsService {
  constructor(
    @Inject('FestivalAnalyticsRepository')
    private analyticsRepository: Repository<FestivalAnalytics>,
    @Inject('FestivalRepository')
    private festivalRepository: Repository<Festival>,
    @Inject('FestivalAttendeeRepository')
    private attendeeRepository: Repository<FestivalAttendee>,
    @Inject('PerformanceRepository')
    private performanceRepository: Repository<Performance>,
    @Inject('VendorRepository')
    private vendorRepository: Repository<Vendor>,
    @Inject('SponsorRepository')
    private sponsorRepository: Repository<Sponsor>,
  ) {}

  async getFestivalAnalytics(festivalId: string) {
    const festival = await this.festivalRepository.findOne({
      where: { id: festivalId },
      relations: ["stages", "vendors", "sponsors", "attendees"],
    })

    if (!festival) {
      throw new Error("Festival not found")
    }

    const [attendanceData, revenueData, performanceData, vendorData, sponsorData] = await Promise.all([
      this.getAttendanceAnalytics(festivalId),
      this.getRevenueAnalytics(festivalId),
      this.getPerformanceAnalytics(festivalId),
      this.getVendorAnalytics(festivalId),
      this.getSponsorAnalytics(festivalId),
    ])

    return {
      festival: {
        id: festival.id,
        name: festival.name,
        status: festival.status,
        capacity: festival.capacity,
        startDate: festival.startDate,
        endDate: festival.endDate,
      },
      attendance: attendanceData,
      revenue: revenueData,
      performance: performanceData,
      vendors: vendorData,
      sponsors: sponsorData,
      summary: {
        totalAttendees: attendanceData.total,
        occupancyRate: (attendanceData.total / festival.capacity) * 100,
        totalRevenue: revenueData.total,
        totalPerformances: performanceData.total,
        totalVendors: vendorData.total,
        totalSponsors: sponsorData.total,
      },
    }
  }

  async recordAnalytics(festivalId: string, type: AnalyticsType, data: any, metadata?: any) {
    const analytics = this.analyticsRepository.create({
      festivalId,
      type,
      date: new Date(),
      data,
      metadata,
    })

    return await this.analyticsRepository.save(analytics)
  }

  private async getAttendanceAnalytics(festivalId: string) {
    const attendees = await this.attendeeRepository.find({
      where: { festivalId },
    })

    const byTicketType = attendees.reduce((acc, attendee) => {
      acc[attendee.ticketType] = (acc[attendee.ticketType] || 0) + 1
      return acc
    }, {})

    const byStatus = attendees.reduce((acc, attendee) => {
      acc[attendee.status] = (acc[attendee.status] || 0) + 1
      return acc
    }, {})

    const checkedIn = attendees.filter((a) => a.checkInTime).length
    const checkedOut = attendees.filter((a) => a.checkOutTime).length

    return {
      total: attendees.length,
      byTicketType,
      byStatus,
      checkedIn,
      checkedOut,
      currentlyInside: checkedIn - checkedOut,
    }
  }

  private async getRevenueAnalytics(festivalId: string) {
    const attendees = await this.attendeeRepository.find({
      where: { festivalId },
    })

    const ticketRevenue = attendees.reduce((total, attendee) => {
      return total + attendee.pricePaid
    }, 0)

    const vendors = await this.vendorRepository.find({
      where: { festivalId },
    })

    const vendorRevenue = vendors.reduce((total, vendor) => {
      return total + (vendor.fee || 0)
    }, 0)

    const sponsors = await this.sponsorRepository.find({
      where: { festivalId },
    })

    const sponsorRevenue = sponsors.reduce((total, sponsor) => {
      return total + sponsor.sponsorshipValue
    }, 0)

    return {
      total: ticketRevenue + vendorRevenue + sponsorRevenue,
      tickets: ticketRevenue,
      vendors: vendorRevenue,
      sponsors: sponsorRevenue,
      breakdown: {
        ticketPercentage: (ticketRevenue / (ticketRevenue + vendorRevenue + sponsorRevenue)) * 100,
        vendorPercentage: (vendorRevenue / (ticketRevenue + vendorRevenue + sponsorRevenue)) * 100,
        sponsorPercentage: (sponsorRevenue / (ticketRevenue + vendorRevenue + sponsorRevenue)) * 100,
      },
    }
  }

  private async getPerformanceAnalytics(festivalId: string) {
    const performances = await this.performanceRepository.find({
      where: { stage: { festivalId } },
      relations: ["artist", "stage"],
    })

    const byStage = performances.reduce((acc, performance) => {
      const stageName = performance.stage.name
      acc[stageName] = (acc[stageName] || 0) + 1
      return acc
    }, {})

    const byStatus = performances.reduce((acc, performance) => {
      acc[performance.status] = (acc[performance.status] || 0) + 1
      return acc
    }, {})

    const headliners = performances.filter((p) => p.isHeadliner).length
    const totalDuration = performances.reduce((total, p) => total + p.durationMinutes, 0)

    return {
      total: performances.length,
      byStage,
      byStatus,
      headliners,
      averageDuration: totalDuration / performances.length || 0,
      totalDuration,
    }
  }

  private async getVendorAnalytics(festivalId: string) {
    const vendors = await this.vendorRepository.find({
      where: { festivalId },
    })

    const byType = vendors.reduce((acc, vendor) => {
      acc[vendor.type] = (acc[vendor.type] || 0) + 1
      return acc
    }, {})

    const byStatus = vendors.reduce((acc, vendor) => {
      acc[vendor.status] = (acc[vendor.status] || 0) + 1
      return acc
    }, {})

    const totalFees = vendors.reduce((total, vendor) => total + (vendor.fee || 0), 0)

    return {
      total: vendors.length,
      byType,
      byStatus,
      totalFees,
      averageFee: totalFees / vendors.length || 0,
    }
  }

  private async getSponsorAnalytics(festivalId: string) {
    const sponsors = await this.sponsorRepository.find({
      where: { festivalId },
    })

    const byTier = sponsors.reduce((acc, sponsor) => {
      acc[sponsor.tier] = (acc[sponsor.tier] || 0) + 1
      return acc
    }, {})

    const byStatus = sponsors.reduce((acc, sponsor) => {
      acc[sponsor.status] = (acc[sponsor.status] || 0) + 1
      return acc
    }, {})

    const totalValue = sponsors.reduce((total, sponsor) => total + sponsor.sponsorshipValue, 0)

    return {
      total: sponsors.length,
      byTier,
      byStatus,
      totalValue,
      averageValue: totalValue / sponsors.length || 0,
    }
  }

  async generateDailyReport(festivalId: string, date: Date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const dailyAttendees = await this.attendeeRepository.count({
      where: {
        festivalId,
        checkInTime: Between(startOfDay, endOfDay),
      },
    })

    const dailyPerformances = await this.performanceRepository.find({
      where: {
        stage: { festivalId },
        startTime: Between(startOfDay, endOfDay),
      },
      relations: ["artist", "stage"],
    })

    const report = {
      date,
      attendees: {
        checkedIn: dailyAttendees,
      },
      performances: {
        total: dailyPerformances.length,
        completed: dailyPerformances.filter((p) => p.status === "completed").length,
        cancelled: dailyPerformances.filter((p) => p.status === "cancelled").length,
        list: dailyPerformances.map((p) => ({
          artist: p.artist.name,
          stage: p.stage.name,
          startTime: p.startTime,
          status: p.status,
        })),
      },
    }

    // Save the daily report as analytics data
    await this.recordAnalytics(festivalId, AnalyticsType.ATTENDANCE, report, { type: "daily_report", date })

    return report
  }
}
