import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { type Repository, Between } from "typeorm"
import { Festival, FestivalStatus } from "../../database/entities/festival.entity"
import type { CreateFestivalDto } from "./dto/create-festival.dto"
import type { UpdateFestivalDto } from "./dto/update-festival.dto"

@Injectable()
export class FestivalsService {
  constructor(
    @InjectRepository(Festival)
    private festivalRepository: Repository<Festival>,
  ) {}

  async create(createFestivalDto: CreateFestivalDto): Promise<Festival> {
    // Validate dates
    if (new Date(createFestivalDto.startDate) >= new Date(createFestivalDto.endDate)) {
      throw new BadRequestException("Start date must be before end date")
    }

    const festival = this.festivalRepository.create(createFestivalDto)
    return await this.festivalRepository.save(festival)
  }

  async findAll(filters?: {
    status?: FestivalStatus
    startDate?: Date
    endDate?: Date
    location?: string
  }): Promise<Festival[]> {
    const query = this.festivalRepository
      .createQueryBuilder("festival")
      .leftJoinAndSelect("festival.stages", "stages")
      .leftJoinAndSelect("festival.vendors", "vendors")
      .leftJoinAndSelect("festival.sponsors", "sponsors")

    if (filters?.status) {
      query.andWhere("festival.status = :status", { status: filters.status })
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere("festival.startDate BETWEEN :startDate AND :endDate", {
        startDate: filters.startDate,
        endDate: filters.endDate,
      })
    }

    if (filters?.location) {
      query.andWhere("festival.location ILIKE :location", {
        location: `%${filters.location}%`,
      })
    }

    return await query.getMany()
  }

  async findOne(id: string): Promise<Festival> {
    const festival = await this.festivalRepository.findOne({
      where: { id },
      relations: [
        "stages",
        "stages.performances",
        "stages.performances.artist",
        "vendors",
        "sponsors",
        "mapLocations",
        "attendees",
        "organizers",
      ],
    })

    if (!festival) {
      throw new NotFoundException(`Festival with ID ${id} not found`)
    }

    return festival
  }

  async update(id: string, updateFestivalDto: UpdateFestivalDto): Promise<Festival> {
    const festival = await this.findOne(id)

    // Validate dates if provided
    if (updateFestivalDto.startDate && updateFestivalDto.endDate) {
      if (new Date(updateFestivalDto.startDate) >= new Date(updateFestivalDto.endDate)) {
        throw new BadRequestException("Start date must be before end date")
      }
    }

    Object.assign(festival, updateFestivalDto)
    return await this.festivalRepository.save(festival)
  }

  async remove(id: string): Promise<void> {
    const festival = await this.findOne(id)
    await this.festivalRepository.remove(festival)
  }

  async updateStatus(id: string, status: FestivalStatus): Promise<Festival> {
    const festival = await this.findOne(id)
    festival.status = status
    return await this.festivalRepository.save(festival)
  }

  async getFestivalsByDateRange(startDate: Date, endDate: Date): Promise<Festival[]> {
    return await this.festivalRepository.find({
      where: {
        startDate: Between(startDate, endDate),
      },
      relations: ["stages", "vendors", "sponsors"],
    })
  }

  async getUpcomingFestivals(): Promise<Festival[]> {
    const now = new Date()
    return await this.festivalRepository.find({
      where: {
        startDate: Between(now, new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)),
        status: FestivalStatus.ANNOUNCED,
      },
      order: { startDate: "ASC" },
    })
  }

  async getFestivalStatistics(id: string) {
    const festival = await this.findOne(id)

    return {
      totalStages: festival.stages.length,
      totalVendors: festival.vendors.length,
      totalSponsors: festival.sponsors.length,
      totalAttendees: festival.attendees.length,
      capacity: festival.capacity,
      occupancyRate: (festival.attendees.length / festival.capacity) * 100,
      totalPerformances: festival.stages.reduce((total, stage) => total + stage.performances.length, 0),
    }
  }
}
