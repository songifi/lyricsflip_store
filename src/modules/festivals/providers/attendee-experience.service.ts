import { Injectable, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type FestivalAttendee, AttendeeStatus } from "../../database/entities/festival-attendee.entity"
import type { Performance } from "../../database/entities/performance.entity"

@Injectable()
export class AttendeeExperienceService {
  constructor(
    private attendeeRepository: Repository<FestivalAttendee>,
    private performanceRepository: Repository<Performance>,
  ) {}

  async getPersonalSchedule(festivalId: string, userId: string) {
    const attendee = await this.attendeeRepository.findOne({
      where: { festivalId, userId },
      relations: ["user"],
    })

    if (!attendee) {
      throw new NotFoundException("Attendee not found")
    }

    const scheduledPerformances = await Promise.all(
      (attendee.schedule || []).map(async (item) => {
        const performance = await this.performanceRepository.findOne({
          where: { id: item.performanceId },
          relations: ["artist", "stage"],
        })
        return {
          ...performance,
          reminder: item.reminder,
          notes: item.notes,
        }
      }),
    )

    return {
      attendee: {
        id: attendee.id,
        ticketType: attendee.ticketType,
        status: attendee.status,
        preferences: attendee.preferences,
      },
      schedule: scheduledPerformances.sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
    }
  }

  async addToPersonalSchedule(
    festivalId: string,
    userId: string,
    performanceId: string,
    reminder = false,
    notes?: string,
  ) {
    const attendee = await this.attendeeRepository.findOne({
      where: { festivalId, userId },
    })

    if (!attendee) {
      throw new NotFoundException("Attendee not found")
    }

    const schedule = attendee.schedule || []
    const existingIndex = schedule.findIndex((item) => item.performanceId === performanceId)

    if (existingIndex >= 0) {
      // Update existing entry
      schedule[existingIndex] = { performanceId, reminder, notes }
    } else {
      // Add new entry
      schedule.push({ performanceId, reminder, notes })
    }

    attendee.schedule = schedule
    return await this.attendeeRepository.save(attendee)
  }

  async removeFromPersonalSchedule(festivalId: string, userId: string, performanceId: string) {
    const attendee = await this.attendeeRepository.findOne({
      where: { festivalId, userId },
    })

    if (!attendee) {
      throw new NotFoundException("Attendee not found")
    }

    attendee.schedule = (attendee.schedule || []).filter((item) => item.performanceId !== performanceId)

    return await this.attendeeRepository.save(attendee)
  }

  async getRecommendations(festivalId: string, userId: string) {
    const attendee = await this.attendeeRepository.findOne({
      where: { festivalId, userId },
    })

    if (!attendee) {
      throw new NotFoundException("Attendee not found")
    }

    const preferences = attendee.preferences
    if (!preferences?.favoriteGenres?.length && !preferences?.favoriteArtists?.length) {
      return { recommendations: [], message: "No preferences set" }
    }

    // Get all performances for the festival
    const performances = await this.performanceRepository.find({
      where: { stage: { festivalId } },
      relations: ["artist", "stage"],
    })

    // Simple recommendation algorithm based on preferences
    const recommendations = performances
      .filter((performance) => {
        // Check if artist is in favorites
        if (preferences.favoriteArtists?.includes(performance.artist.name)) {
          return true
        }

        // Check if artist's genres match preferences
        if (preferences.favoriteGenres?.some((genre) => performance.artist.genres?.includes(genre))) {
          return true
        }

        return false
      })
      .map((performance) => ({
        ...performance,
        recommendationReason: this.getRecommendationReason(performance, preferences),
      }))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

    return { recommendations }
  }

  async checkIn(festivalId: string, userId: string) {
    const attendee = await this.attendeeRepository.findOne({
      where: { festivalId, userId },
    })

    if (!attendee) {
      throw new NotFoundException("Attendee not found")
    }

    attendee.status = AttendeeStatus.CHECKED_IN
    attendee.checkInTime = new Date()

    return await this.attendeeRepository.save(attendee)
  }

  async checkOut(festivalId: string, userId: string) {
    const attendee = await this.attendeeRepository.findOne({
      where: { festivalId, userId },
    })

    if (!attendee) {
      throw new NotFoundException("Attendee not found")
    }

    attendee.status = AttendeeStatus.CHECKED_OUT
    attendee.checkOutTime = new Date()

    return await this.attendeeRepository.save(attendee)
  }

  private getRecommendationReason(performance: any, preferences: any): string {
    if (preferences.favoriteArtists?.includes(performance.artist.name)) {
      return "One of your favorite artists"
    }

    const matchingGenres = preferences.favoriteGenres?.filter((genre) => performance.artist.genres?.includes(genre))

    if (matchingGenres?.length) {
      return `Matches your taste in ${matchingGenres.join(", ")}`
    }

    return "Recommended for you"
  }
}
