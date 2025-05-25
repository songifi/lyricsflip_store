import { Injectable, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type StudentProgress, ProgressStatus } from "../entities/student-progress.entity"
import type { LessonCompletion } from "../entities/lesson-completion.entity"
import type { Course } from "../entities/course.entity"
import type { UpdateProgressDto } from "../dto/update-progress.dto"

@Injectable()
export class ProgressService {
  constructor(
    private progressRepository: Repository<StudentProgress>,
    private lessonCompletionRepository: Repository<LessonCompletion>,
    private courseRepository: Repository<Course>,
  ) {}

  async enrollStudent(studentId: string, courseId: string): Promise<StudentProgress> {
    const existingProgress = await this.progressRepository.findOne({
      where: { studentId, courseId },
    })

    if (existingProgress) {
      return existingProgress
    }

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ["lessons", "lessons.exercises", "lessons.assignments"],
    })

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`)
    }

    const totalLessons = course.lessons.length
    const totalExercises = course.lessons.reduce((sum, lesson) => sum + lesson.exercises.length, 0)
    const totalAssignments = course.lessons.reduce((sum, lesson) => sum + lesson.assignments.length, 0)

    const progress = this.progressRepository.create({
      studentId,
      courseId,
      status: ProgressStatus.NOT_STARTED,
      totalLessons,
      totalExercises,
      totalAssignments,
      enrolledAt: new Date(),
      streakData: {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date(),
      },
      preferences: {
        playbackSpeed: 1.0,
        autoplay: true,
        subtitles: false,
        notifications: true,
      },
    })

    return await this.progressRepository.save(progress)
  }

  async getStudentProgress(studentId: string, courseId: string): Promise<StudentProgress> {
    const progress = await this.progressRepository.findOne({
      where: { studentId, courseId },
      relations: ["student", "course"],
    })

    if (!progress) {
      throw new NotFoundException("Progress not found")
    }

    return progress
  }

  async updateProgress(studentId: string, courseId: string, updateDto: UpdateProgressDto): Promise<StudentProgress> {
    const progress = await this.getStudentProgress(studentId, courseId)

    Object.assign(progress, updateDto)

    // Update status based on completion percentage
    if (updateDto.completionPercentage !== undefined) {
      if (updateDto.completionPercentage === 0) {
        progress.status = ProgressStatus.NOT_STARTED
      } else if (updateDto.completionPercentage === 100) {
        progress.status = ProgressStatus.COMPLETED
        progress.completedAt = new Date()
      } else {
        progress.status = ProgressStatus.IN_PROGRESS
      }
    }

    // Update streak data
    const today = new Date()
    const lastActivity = new Date(progress.streakData.lastActivityDate)
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff === 1) {
      progress.streakData.currentStreak += 1
      progress.streakData.longestStreak = Math.max(progress.streakData.longestStreak, progress.streakData.currentStreak)
    } else if (daysDiff > 1) {
      progress.streakData.currentStreak = 1
    }

    progress.streakData.lastActivityDate = today
    progress.lastAccessedAt = today

    return await this.progressRepository.save(progress)
  }

  async completeLesson(
    studentId: string,
    lessonId: string,
    completionData: {
      timeSpentMinutes: number
      videoWatchTimeSeconds?: number
      exercisesCompleted?: number
      score?: number
      maxScore?: number
    },
  ): Promise<LessonCompletion> {
    const existingCompletion = await this.lessonCompletionRepository.findOne({
      where: { studentId, lessonId },
    })

    if (existingCompletion) {
      Object.assign(existingCompletion, completionData)
      existingCompletion.completedAt = new Date()
      existingCompletion.lastAccessedAt = new Date()
      existingCompletion.attempts += 1
      return await this.lessonCompletionRepository.save(existingCompletion)
    }

    const completion = this.lessonCompletionRepository.create({
      studentId,
      lessonId,
      ...completionData,
      completionPercentage: 100,
      attempts: 1,
      firstAccessedAt: new Date(),
      lastAccessedAt: new Date(),
      completedAt: new Date(),
    })

    return await this.lessonCompletionRepository.save(completion)
  }

  async getStudentDashboard(studentId: string): Promise<{
    enrolledCourses: number
    completedCourses: number
    inProgressCourses: number
    totalTimeSpent: number
    currentStreak: number
    longestStreak: number
    recentActivity: any[]
  }> {
    const allProgress = await this.progressRepository.find({
      where: { studentId },
      relations: ["course"],
    })

    const enrolledCourses = allProgress.length
    const completedCourses = allProgress.filter((p) => p.status === ProgressStatus.COMPLETED).length
    const inProgressCourses = allProgress.filter((p) => p.status === ProgressStatus.IN_PROGRESS).length
    const totalTimeSpent = allProgress.reduce((sum, p) => sum + p.totalTimeSpentMinutes, 0)

    // Get current and longest streak
    let currentStreak = 0
    let longestStreak = 0

    allProgress.forEach((progress) => {
      currentStreak = Math.max(currentStreak, progress.streakData?.currentStreak || 0)
      longestStreak = Math.max(longestStreak, progress.streakData?.longestStreak || 0)
    })

    // Get recent activity (last 10 lesson completions)
    const recentActivity = await this.lessonCompletionRepository.find({
      where: { studentId },
      relations: ["lesson", "lesson.course"],
      order: { completedAt: "DESC" },
      take: 10,
    })

    return {
      enrolledCourses,
      completedCourses,
      inProgressCourses,
      totalTimeSpent,
      currentStreak,
      longestStreak,
      recentActivity,
    }
  }

  async getLeaderboard(courseId?: string, limit = 10): Promise<any[]> {
    const queryBuilder = this.progressRepository
      .createQueryBuilder("progress")
      .leftJoinAndSelect("progress.student", "student")
      .leftJoinAndSelect("progress.course", "course")
      .orderBy("progress.completionPercentage", "DESC")
      .addOrderBy("progress.totalScore", "DESC")
      .addOrderBy("progress.totalTimeSpentMinutes", "ASC")
      .take(limit)

    if (courseId) {
      queryBuilder.where("progress.courseId = :courseId", { courseId })
    }

    return await queryBuilder.getMany()
  }
}
