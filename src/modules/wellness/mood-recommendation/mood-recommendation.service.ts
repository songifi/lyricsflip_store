import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type MoodEntry, MoodType, EnergyLevel, StressLevel } from "../../../database/entities/mood-entry.entity"
import { type TherapeuticTrack, TherapeuticIntent } from "../../../database/entities/therapeutic-track.entity"
import type { CreateMoodEntryDto } from "../dto/mood-entry.dto"

@Injectable()
export class MoodRecommendationService {
  constructor(
    private moodEntryRepository: Repository<MoodEntry>,
    private therapeuticTrackRepository: Repository<TherapeuticTrack>,
  ) {}

  async createMoodEntry(userId: string, moodData: CreateMoodEntryDto): Promise<MoodEntry> {
    const moodEntry = this.moodEntryRepository.create({
      userId,
      ...moodData,
    })

    return this.moodEntryRepository.save(moodEntry)
  }

  async getUserMoodHistory(userId: string, days = 30): Promise<MoodEntry[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    return this.moodEntryRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    })
  }

  async getRecommendationsForMood(
    mood: MoodType,
    energy: EnergyLevel,
    stress: StressLevel,
  ): Promise<TherapeuticTrack[]> {
    const intent = this.determineTherapeuticIntent(mood, energy, stress)
    const targetMoods = this.getMoodTargets(mood)
    const targetEnergy = this.getEnergyTargets(energy)
    const targetStress = this.getStressTargets(stress)

    const queryBuilder = this.therapeuticTrackRepository
      .createQueryBuilder("track")
      .leftJoinAndSelect("track.category", "category")
      .where("track.isActive = :isActive", { isActive: true })

    if (intent) {
      queryBuilder.andWhere("track.therapeuticIntent = :intent", { intent })
    }

    // Add mood, energy, and stress level matching
    if (targetMoods.length > 0) {
      queryBuilder.andWhere("track.targetMoods && :targetMoods", { targetMoods })
    }

    if (targetEnergy.length > 0) {
      queryBuilder.andWhere("track.targetEnergyLevels && :targetEnergy", { targetEnergy })
    }

    if (targetStress.length > 0) {
      queryBuilder.andWhere("track.targetStressLevels && :targetStress", { targetStress })
    }

    return queryBuilder.limit(10).getMany()
  }

  private determineTherapeuticIntent(
    mood: MoodType,
    energy: EnergyLevel,
    stress: StressLevel,
  ): TherapeuticIntent | null {
    // High stress always gets anxiety relief
    if (stress >= StressLevel.HIGH) {
      return TherapeuticIntent.ANXIETY_RELIEF
    }

    // Low mood gets mood boost
    if (mood <= MoodType.SAD) {
      return TherapeuticIntent.MOOD_BOOST
    }

    // Low energy gets energizing
    if (energy <= EnergyLevel.LOW) {
      return TherapeuticIntent.ENERGIZING
    }

    // High energy might need relaxation
    if (energy >= EnergyLevel.HIGH && stress >= StressLevel.MODERATE) {
      return TherapeuticIntent.RELAXATION
    }

    // Default to relaxation for moderate states
    return TherapeuticIntent.RELAXATION
  }

  private getMoodTargets(mood: MoodType): string[] {
    const targets = []

    if (mood <= MoodType.SAD) {
      targets.push("sad", "depressed", "low")
    } else if (mood === MoodType.NEUTRAL) {
      targets.push("neutral", "balanced")
    } else {
      targets.push("happy", "positive", "uplifted")
    }

    return targets
  }

  private getEnergyTargets(energy: EnergyLevel): string[] {
    const targets = []

    if (energy <= EnergyLevel.LOW) {
      targets.push("low_energy", "tired", "fatigued")
    } else if (energy === EnergyLevel.MODERATE) {
      targets.push("moderate_energy", "balanced")
    } else {
      targets.push("high_energy", "energetic", "active")
    }

    return targets
  }

  private getStressTargets(stress: StressLevel): string[] {
    const targets = []

    if (stress <= StressLevel.LOW) {
      targets.push("calm", "relaxed", "peaceful")
    } else if (stress === StressLevel.MODERATE) {
      targets.push("moderate_stress", "balanced")
    } else {
      targets.push("high_stress", "anxious", "overwhelmed")
    }

    return targets
  }

  async getMoodAnalytics(userId: string): Promise<any> {
    const moodEntries = await this.getUserMoodHistory(userId, 30)

    if (moodEntries.length === 0) {
      return {
        averageMood: 0,
        averageEnergy: 0,
        averageStress: 0,
        moodTrend: "stable",
        totalEntries: 0,
      }
    }

    const averageMood = moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length
    const averageEnergy = moodEntries.reduce((sum, entry) => sum + entry.energy, 0) / moodEntries.length
    const averageStress = moodEntries.reduce((sum, entry) => sum + entry.stress, 0) / moodEntries.length

    // Calculate trend (comparing first half vs second half of entries)
    const halfPoint = Math.floor(moodEntries.length / 2)
    const recentMood = moodEntries.slice(0, halfPoint).reduce((sum, entry) => sum + entry.mood, 0) / halfPoint
    const olderMood =
      moodEntries.slice(halfPoint).reduce((sum, entry) => sum + entry.mood, 0) / (moodEntries.length - halfPoint)

    let moodTrend = "stable"
    if (recentMood > olderMood + 0.5) moodTrend = "improving"
    else if (recentMood < olderMood - 0.5) moodTrend = "declining"

    return {
      averageMood: Math.round(averageMood * 100) / 100,
      averageEnergy: Math.round(averageEnergy * 100) / 100,
      averageStress: Math.round(averageStress * 100) / 100,
      moodTrend,
      totalEntries: moodEntries.length,
      weeklyBreakdown: this.getWeeklyBreakdown(moodEntries),
    }
  }

  private getWeeklyBreakdown(entries: MoodEntry[]): any[] {
    const weeks = {}

    entries.forEach((entry) => {
      const weekStart = new Date(entry.createdAt)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekKey = weekStart.toISOString().split("T")[0]

      if (!weeks[weekKey]) {
        weeks[weekKey] = { mood: [], energy: [], stress: [], count: 0 }
      }

      weeks[weekKey].mood.push(entry.mood)
      weeks[weekKey].energy.push(entry.energy)
      weeks[weekKey].stress.push(entry.stress)
      weeks[weekKey].count++
    })

    return Object.entries(weeks).map(([week, data]: [string, any]) => ({
      week,
      averageMood: data.mood.reduce((a, b) => a + b, 0) / data.count,
      averageEnergy: data.energy.reduce((a, b) => a + b, 0) / data.count,
      averageStress: data.stress.reduce((a, b) => a + b, 0) / data.count,
      entryCount: data.count,
    }))
  }
}
