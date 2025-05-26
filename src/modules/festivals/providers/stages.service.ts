import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Stage } from "../../database/entities/stage.entity"
import type { CreateStageDto } from "./dto/create-stage.dto"
import type { UpdateStageDto } from "./dto/update-stage.dto"

@Injectable()
export class StagesService {
  private stageRepository: Repository<Stage>

  constructor(
    @InjectRepository(Stage)
    stageRepository: Repository<Stage>,
  ) {
    this.stageRepository = stageRepository;
  }

  async create(createStageDto: CreateStageDto): Promise<Stage> {
    const stage = this.stageRepository.create(createStageDto)
    return await this.stageRepository.save(stage)
  }

  async findByFestival(festivalId: string): Promise<Stage[]> {
    return await this.stageRepository.find({
      where: { festivalId, isActive: true },
      relations: ["performances", "performances.artist"],
      order: { name: "ASC" },
    })
  }

  async findOne(id: string): Promise<Stage> {
    const stage = await this.stageRepository.findOne({
      where: { id },
      relations: ["festival", "performances", "performances.artist"],
    })

    if (!stage) {
      throw new NotFoundException(`Stage with ID ${id} not found`)
    }

    return stage
  }

  async update(id: string, updateStageDto: UpdateStageDto): Promise<Stage> {
    const stage = await this.findOne(id)
    Object.assign(stage, updateStageDto)
    return await this.stageRepository.save(stage)
  }

  async remove(id: string): Promise<void> {
    const stage = await this.findOne(id)

    // Check if stage has performances
    if (stage.performances && stage.performances.length > 0) {
      throw new BadRequestException("Cannot delete stage with scheduled performances")
    }

    await this.stageRepository.remove(stage)
  }

  async deactivate(id: string): Promise<Stage> {
    const stage = await this.findOne(id)
    stage.isActive = false
    return await this.stageRepository.save(stage)
  }

  async getStageUtilization(id: string) {
    const stage = await this.findOne(id)

    const totalMinutes = stage.performances.reduce((total, performance) => total + performance.durationMinutes, 0)

    // Assuming 12 hours of operation per day during festival
    const festivalDays = Math.ceil(
      (stage.festival.endDate.getTime() - stage.festival.startDate.getTime()) / (1000 * 60 * 60 * 24),
    )
    const availableMinutes = festivalDays * 12 * 60

    return {
      stageId: stage.id,
      stageName: stage.name,
      totalPerformances: stage.performances.length,
      totalMinutes,
      availableMinutes,
      utilizationRate: (totalMinutes / availableMinutes) * 100,
      performances: stage.performances.map((p) => ({
        artist: p.artist.name,
        startTime: p.startTime,
        duration: p.durationMinutes,
        status: p.status,
      })),
    }
  }
}
