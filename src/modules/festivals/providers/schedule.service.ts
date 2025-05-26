import { Injectable, BadRequestException, ConflictException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Performance, PerformanceStatus } from "../../database/entities/performance.entity"
import type { Stage } from "../../database/entities/stage.entity"
import type { CreatePerformanceDto } from "./dto/create-performance.dto"
import type { UpdatePerformanceDto } from "./dto/update-performance.dto"

@Injectable()
export class ScheduleService {
  constructor(
    private performanceRepository: Repository<Performance>,
    private stageRepository: Repository<Stage>,
  ) {}

  async createPerformance(createPerformanceDto: CreatePerformanceDto): Promise<Performance> {
    // Validate time slots
    await this.validateTimeSlot(
      createPerformanceDto.stageId,
      new Date(createPerformanceDto.startTime),
      new Date(createPerformanceDto.endTime),
    )

    const performance = this.performanceRepository.create(createPerformanceDto)
    return await this.performanceRepository.save(performance)
  }

  async updatePerformance(id: string, updatePerformanceDto: UpdatePerformanceDto): Promise<Performance> {
    const performance = await this.performanceRepository.findOne({
      where: { id },
      relations: ["stage", "artist"],
    })

    if (!performance) {
      throw new BadRequestException(`Performance with ID ${id} not found`)
    }

    // Validate time slot if times are being updated
    if (updatePerformanceDto.startTime || updatePerformanceDto.endTime) {
      const startTime = updatePerformanceDto.startTime
        ? new Date(updatePerformanceDto.startTime)
        : performance.startTime
      const endTime = updatePerformanceDto.endTime ? new Date(updatePerformanceDto.endTime) : performance.endTime

      await this.validateTimeSlot(performance.stageId, startTime, endTime, id)
    }

    Object.assign(performance, updatePerformanceDto)
    return await this.performanceRepository.save(performance)
  }

  async getFestivalSchedule(festivalId: string): Promise<any> {
    const stages = await this.stageRepository.find({
      where: { festivalId },
      relations: ["performances", "performances.artist"],
      order: { name: "ASC" },
    })

    return stages.map((stage) => ({
      stage: {
        id: stage.id,
        name: stage.name,
        type: stage.type,
        capacity: stage.capacity,
      },
      performances: stage.performances
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
        .map((performance) => ({
          id: performance.id,
          artist: performance.artist,
          startTime: performance.startTime,
          endTime: performance.endTime,
          status: performance.status,
          isHeadliner: performance.isHeadliner,
        })),
    }))
  }

  async getArtistSchedule(artistId: string, festivalId?: string): Promise<Performance[]> {
    const query = this.performanceRepository
      .createQueryBuilder("performance")
      .leftJoinAndSelect("performance.stage", "stage")
      .leftJoinAndSelect("stage.festival", "festival")
      .where("performance.artistId = :artistId", { artistId })

    if (festivalId) {
      query.andWhere("stage.festivalId = :festivalId", { festivalId })
    }

    return await query.getMany()
  }

  async checkScheduleConflicts(festivalId: string): Promise<any[]> {
    const stages = await this.stageRepository.find({
      where: { festivalId },
      relations: ["performances", "performances.artist"],
    })

    const conflicts = []

    for (const stage of stages) {
      const performances = stage.performances.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

      for (let i = 0; i < performances.length - 1; i++) {
        const current = performances[i]
        const next = performances[i + 1]

        if (current.endTime > next.startTime) {
          conflicts.push({
            type: "overlap",
            stage: stage.name,
            performance1: {
              id: current.id,
              artist: current.artist.name,
              time: `${current.startTime} - ${current.endTime}`,
            },
            performance2: {
              id: next.id,
              artist: next.artist.name,
              time: `${next.startTime} - ${next.endTime}`,
            },
          })
        }
      }
    }

    return conflicts
  }

  async updatePerformanceStatus(id: string, status: PerformanceStatus): Promise<Performance> {
    const performance = await this.performanceRepository.findOne({
      where: { id },
      relations: ["stage", "artist"],
    })

    if (!performance) {
      throw new BadRequestException(`Performance with ID ${id} not found`)
    }

    performance.status = status
    return await this.performanceRepository.save(performance)
  }

  private async validateTimeSlot(
    stageId: string,
    startTime: Date,
    endTime: Date,
    excludePerformanceId?: string,
  ): Promise<void> {
    if (startTime >= endTime) {
      throw new BadRequestException("Start time must be before end time")
    }

    const query = this.performanceRepository
      .createQueryBuilder("performance")
      .where("performance.stageId = :stageId", { stageId })
      .andWhere("(performance.startTime < :endTime AND performance.endTime > :startTime)", { startTime, endTime })

    if (excludePerformanceId) {
      query.andWhere("performance.id != :excludePerformanceId", { excludePerformanceId })
    }

    const conflictingPerformance = await query.getOne()

    if (conflictingPerformance) {
      throw new ConflictException("Time slot conflicts with existing performance")
    }
  }
}
