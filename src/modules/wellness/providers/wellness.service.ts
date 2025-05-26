import { Injectable, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { WellnessCategory, TherapeuticCategory } from "../../database/entities/wellness-category.entity"
import type { WellnessProgram } from "../../database/entities/wellness-program.entity"
import type { UserWellnessProgress } from "../../database/entities/user-wellness-progress.entity"
import type { CreateWellnessProgramDto } from "./dto/create-wellness-program.dto"

@Injectable()
export class WellnessService {
  constructor(
    private wellnessCategoryRepository: Repository<WellnessCategory>,
    private wellnessProgramRepository: Repository<WellnessProgram>,
    private userProgressRepository: Repository<UserWellnessProgress>,
  ) {}

  async createCategory(categoryData: Partial<WellnessCategory>): Promise<WellnessCategory> {
    const category = this.wellnessCategoryRepository.create(categoryData)
    return this.wellnessCategoryRepository.save(category)
  }

  async getAllCategories(): Promise<WellnessCategory[]> {
    return this.wellnessCategoryRepository.find({
      where: { isActive: true },
      relations: ["programs"],
    })
  }

  async getCategoryByType(category: TherapeuticCategory): Promise<WellnessCategory> {
    const wellnessCategory = await this.wellnessCategoryRepository.findOne({
      where: { category, isActive: true },
      relations: ["programs", "tracks"],
    })

    if (!wellnessCategory) {
      throw new NotFoundException(`Wellness category ${category} not found`)
    }

    return wellnessCategory
  }

  async createProgram(programData: CreateWellnessProgramDto): Promise<WellnessProgram> {
    const program = this.wellnessProgramRepository.create(programData)
    return this.wellnessProgramRepository.save(program)
  }

  async getAllPrograms(): Promise<WellnessProgram[]> {
    return this.wellnessProgramRepository.find({
      where: { isActive: true },
      relations: ["category"],
    })
  }

  async getProgramsByCategory(categoryId: string): Promise<WellnessProgram[]> {
    return this.wellnessProgramRepository.find({
      where: { categoryId, isActive: true },
      relations: ["category"],
    })
  }

  async getUserProgress(userId: string): Promise<UserWellnessProgress[]> {
    return this.userProgressRepository.find({
      where: { userId },
      relations: ["program", "program.category"],
      order: { updatedAt: "DESC" },
    })
  }

  async startProgram(userId: string, programId: string): Promise<UserWellnessProgress> {
    const existingProgress = await this.userProgressRepository.findOne({
      where: { userId, programId },
    })

    if (existingProgress) {
      return existingProgress
    }

    const progress = this.userProgressRepository.create({
      userId,
      programId,
      status: "not_started",
    })

    return this.userProgressRepository.save(progress)
  }

  async updateProgress(
    userId: string,
    programId: string,
    updateData: Partial<UserWellnessProgress>,
  ): Promise<UserWellnessProgress> {
    const progress = await this.userProgressRepository.findOne({
      where: { userId, programId },
    })

    if (!progress) {
      throw new NotFoundException("Progress record not found")
    }

    Object.assign(progress, updateData)
    return this.userProgressRepository.save(progress)
  }

  async getWellnessStats(userId: string): Promise<any> {
    const progress = await this.getUserProgress(userId)

    const stats = {
      totalPrograms: progress.length,
      completedPrograms: progress.filter((p) => p.status === "completed").length,
      totalMinutes: progress.reduce((sum, p) => sum + p.totalMinutesSpent, 0),
      currentStreak: Math.max(...progress.map((p) => p.currentStreak || 0)),
      longestStreak: Math.max(...progress.map((p) => p.longestStreak || 0)),
      averageCompletion:
        progress.length > 0 ? progress.reduce((sum, p) => sum + p.completionPercentage, 0) / progress.length : 0,
    }

    return stats
  }
}
