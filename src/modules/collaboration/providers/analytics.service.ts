import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { ProjectAnalytics } from "../entities/project-analytics.entity"
import { type ProjectMember, MemberStatus } from "../entities/project-member.entity"
import { type Task, TaskStatus } from "../entities/task.entity"
import type { AudioVersion } from "../entities/audio-version.entity"
import type { Feedback } from "../entities/feedback.entity"

@Injectable()
export class AnalyticsService {
  constructor(
    private analyticsRepository: Repository<ProjectAnalytics>,
    private memberRepository: Repository<ProjectMember>,
    private taskRepository: Repository<Task>,
    private audioVersionRepository: Repository<AudioVersion>,
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async generateDailyAnalytics(projectId: string, date: Date): Promise<ProjectAnalytics> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Get active members
    const activeMembers = await this.memberRepository.count({
      where: {
        projectId,
        status: MemberStatus.ACTIVE,
        lastActiveAt: {
          gte: startOfDay,
          lte: endOfDay,
        } as any,
      },
    })

    // Get completed tasks for the day
    const tasksCompleted = await this.taskRepository.count({
      where: {
        projectId,
        status: TaskStatus.COMPLETED,
        completedAt: {
          gte: startOfDay,
          lte: endOfDay,
        } as any,
      },
    })

    // Get audio versions uploaded
    const audioVersionsUploaded = await this.audioVersionRepository.count({
      where: {
        projectId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        } as any,
      },
    })

    // Get feedback received
    const feedbackReceived = await this.feedbackRepository.count({
      where: {
        audioVersion: { projectId },
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        } as any,
      },
    })

    // Get member activity (simplified)
    const memberActivity = await this.getMemberActivity(projectId, startOfDay, endOfDay)

    const metrics = {
      activeMembers,
      tasksCompleted,
      audioVersionsUploaded,
      feedbackReceived,
      collaborationTime: 0, // This would require session tracking
      memberActivity,
      milestones: [], // This would require milestone definition
    }

    const analytics = this.analyticsRepository.create({
      projectId,
      date: startOfDay,
      metrics,
    })

    return this.analyticsRepository.save(analytics)
  }

  async getProjectAnalytics(projectId: string, startDate: Date, endDate: Date): Promise<ProjectAnalytics[]> {
    return this.analyticsRepository
      .createQueryBuilder("analytics")
      .where("analytics.projectId = :projectId", { projectId })
      .andWhere("analytics.date >= :startDate", { startDate })
      .andWhere("analytics.date <= :endDate", { endDate })
      .orderBy("analytics.date", "ASC")
      .getMany()
  }

  private async getMemberActivity(projectId: string, startDate: Date, endDate: Date): Promise<any[]> {
    // This is a simplified version - in a real implementation,
    // you'd track user sessions and activities
    const members = await this.memberRepository.find({
      where: { projectId, status: MemberStatus.ACTIVE },
      relations: ["user"],
    })

    return members.map((member) => ({
      userId: member.userId,
      timeSpent: Math.random() * 120, // Mock data
      actionsPerformed: Math.floor(Math.random() * 20),
    }))
  }
}
