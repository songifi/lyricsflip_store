import { Injectable, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type MeditationSession, SessionStatus } from "../../../database/entities/meditation-session.entity"
import type { WellnessProgram } from "../../../database/entities/wellness-program.entity"
import type { UserWellnessProgress } from "../../../database/entities/user-wellness-progress.entity"
import type { CreateMeditationSessionDto, UpdateMeditationSessionDto } from "../dto/meditation-session.dto"

@Injectable()
export class MeditationService {
  constructor(
    private meditationSessionRepository: Repository<MeditationSession>,
    private wellnessProgramRepository: Repository<WellnessProgram>,
    private userProgressRepository: Repository<UserWellnessProgress>,
  ) {}

  async startMeditationSession(userId: string, sessionData: CreateMeditationSessionDto): Promise<MeditationSession> {
    // Verify program exists
    const program = await this.wellnessProgramRepository.findOne({
      where: { id: sessionData.programId },
    })

    if (!program) {
      throw new NotFoundException("Wellness program not found")
    }

    const session = this.meditationSessionRepository.create({
      userId,
      ...sessionData,
      status: SessionStatus.STARTED,
    })

    const savedSession = await this.meditationSessionRepository.save(session)

    // Update user progress
    await this.updateUserProgress(userId, sessionData.programId)

    return savedSession
  }

  async updateMeditationSession(
    sessionId: string,
    userId: string,
    updateData: UpdateMeditationSessionDto,
  ): Promise<MeditationSession> {
    const session = await this.meditationSessionRepository.findOne({
      where: { id: sessionId, userId },
    })

    if (!session) {
      throw new NotFoundException("Meditation session not found")
    }

    Object.assign(session, updateData)
    const updatedSession = await this.meditationSessionRepository.save(session)

    // If session is completed, update progress
    if (updateData.status === SessionStatus.COMPLETED) {
      await this.updateUserProgress(userId, session.programId, session.actualDurationMinutes)
    }

    return updatedSession
  }

  async getUserSessions(userId: string, limit = 20): Promise<MeditationSession[]> {
    return this.meditationSessionRepository.find({
      where: { userId },
      relations: ["program"],
      order: { createdAt: "DESC" },
      take: limit,
    })
  }

  async getSessionById(sessionId: string, userId: string): Promise<MeditationSession> {
    const session = await this.meditationSessionRepository.findOne({
      where: { id: sessionId, userId },
      relations: ["program"],
    })

    if (!session) {
      throw new NotFoundException("Meditation session not found")
    }

    return session
  }

  async getMeditationStats(userId: string): Promise<any> {
    const sessions = await this.meditationSessionRepository.find({
      where: { userId },
    })

    const completedSessions = sessions.filter((s) => s.status === SessionStatus.COMPLETED)
    const totalMinutes = completedSessions.reduce((sum, s) => sum + s.actualDurationMinutes, 0)

    // Calculate streak
    const sortedSessions = completedSessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    for (let i = 0; i < sortedSessions.length; i++) {
      const sessionDate = new Date(sortedSessions[i].createdAt)
      const today = new Date()
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))

      if (i === 0 && daysDiff <= 1) {
        currentStreak = 1
        tempStreak = 1
      } else if (i > 0) {
        const prevSessionDate = new Date(sortedSessions[i - 1].createdAt)
        const daysBetween = Math.floor((prevSessionDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysBetween === 1) {
          tempStreak++
          if (i === 1) currentStreak = tempStreak
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
          if (i === 1) currentStreak = 0
        }
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak)

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      totalMinutes,
      averageSessionLength: completedSessions.length > 0 ? Math.round(totalMinutes / completedSessions.length) : 0,
      currentStreak,
      longestStreak,
      completionRate: sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0,
    }
  }

  private async updateUserProgress(userId: string, programId: string, additionalMinutes = 0): Promise<void> {
    let progress = await this.userProgressRepository.findOne({
      where: { userId, programId },
    })

    if (!progress) {
      progress = this.userProgressRepository.create({
        userId,
        programId,
        status: "in_progress",
      })
    }

    const completedSessions = await this.meditationSessionRepository.count({
      where: {
        userId,
        programId,
        status: SessionStatus.COMPLETED,
      },
    })

    progress.completedSessions = completedSessions
    progress.totalMinutesSpent += additionalMinutes
    progress.lastSessionDate = new Date()

    // Get program to calculate completion percentage
    const program = await this.wellnessProgramRepository.findOne({
      where: { id: programId },
    })

    if (program) {
      progress.completionPercentage = (completedSessions / program.totalSessions) * 100

      if (progress.completionPercentage >= 100) {
        progress.status = "completed"
      } else {
        progress.status = "in_progress"
      }
    }

    await this.userProgressRepository.save(progress)
  }
}
