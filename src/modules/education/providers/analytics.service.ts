import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Course } from "../entities/course.entity"
import type { StudentProgress } from "../entities/student-progress.entity"
import type { LessonCompletion } from "../entities/lesson-completion.entity"
import type { AssignmentSubmission } from "../entities/assignment-submission.entity"

@Injectable()
export class AnalyticsService {
  constructor(
    private courseRepository: Repository<Course>,
    private progressRepository: Repository<StudentProgress>,
    private lessonCompletionRepository: Repository<LessonCompletion>,
    private assignmentSubmissionRepository: Repository<AssignmentSubmission>,
  ) {}

  async getCourseAnalytics(courseId: string): Promise<any> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ["lessons", "studentProgress"],
    })

    if (!course) {
      throw new Error("Course not found")
    }

    const totalEnrollments = course.enrollmentCount
    const activeStudents = course.studentProgress.filter((p) => p.status === "in_progress").length
    const completedStudents = course.studentProgress.filter((p) => p.status === "completed").length
    const averageProgress =
      course.studentProgress.reduce((sum, p) => sum + p.completionPercentage, 0) / course.studentProgress.length || 0

    // Get lesson completion rates
    const lessonCompletions = await this.lessonCompletionRepository
      .createQueryBuilder("completion")
      .leftJoin("completion.lesson", "lesson")
      .where("lesson.courseId = :courseId", { courseId })
      .getMany()

    const lessonStats = course.lessons.map((lesson) => {
      const completions = lessonCompletions.filter((c) => c.lessonId === lesson.id)
      return {
        lessonId: lesson.id,
        title: lesson.title,
        completionRate: (completions.length / totalEnrollments) * 100,
        averageTimeSpent: completions.reduce((sum, c) => sum + c.timeSpentMinutes, 0) / completions.length || 0,
        averageScore: completions.reduce((sum, c) => sum + c.score, 0) / completions.length || 0,
      }
    })

    // Get assignment submission rates
    const assignmentSubmissions = await this.assignmentSubmissionRepository
      .createQueryBuilder("submission")
      .leftJoin("submission.assignment", "assignment")
      .leftJoin("assignment.lesson", "lesson")
      .where("lesson.courseId = :courseId", { courseId })
      .getMany()

    return {
      overview: {
        totalEnrollments,
        activeStudents,
        completedStudents,
        completionRate: (completedStudents / totalEnrollments) * 100,
        averageProgress,
        averageRating: course.averageRating,
        reviewCount: course.reviewCount,
      },
      lessonStats,
      engagementMetrics: {
        averageTimePerSession:
          course.studentProgress.reduce((sum, p) => sum + p.totalTimeSpentMinutes, 0) / course.studentProgress.length ||
          0,
        dropoffPoints: this.calculateDropoffPoints(lessonStats),
        mostEngagingLessons: lessonStats.sort((a, b) => b.averageTimeSpent - a.averageTimeSpent).slice(0, 5),
      },
      assignmentMetrics: {
        totalSubmissions: assignmentSubmissions.length,
        averageScore:
          assignmentSubmissions.reduce((sum, s) => sum + (s.percentage || 0), 0) / assignmentSubmissions.length || 0,
        onTimeSubmissions: assignmentSubmissions.filter((s) => !s.isLate).length,
      },
    }
  }

  async getInstructorAnalytics(instructorId: string): Promise<any> {
    const courses = await this.courseRepository.find({
      where: { instructorId },
      relations: ["studentProgress"],
    })

    const totalCourses = courses.length
    const publishedCourses = courses.filter((c) => c.status === "published").length
    const totalEnrollments = courses.reduce((sum, c) => sum + c.enrollmentCount, 0)
    const totalRevenue = courses.reduce((sum, c) => sum + c.price * c.enrollmentCount, 0)
    const averageRating = courses.reduce((sum, c) => sum + c.averageRating, 0) / courses.length || 0

    // Get student progress across all courses
    const allProgress = courses.flatMap((c) => c.studentProgress)
    const completedStudents = allProgress.filter((p) => p.status === "completed").length
    const activeStudents = allProgress.filter((p) => p.status === "in_progress").length

    return {
      overview: {
        totalCourses,
        publishedCourses,
        totalEnrollments,
        totalRevenue,
        averageRating,
        completedStudents,
        activeStudents,
      },
      coursePerformance: courses.map((course) => ({
        id: course.id,
        title: course.title,
        enrollments: course.enrollmentCount,
        revenue: course.price * course.enrollmentCount,
        rating: course.averageRating,
        completionRate:
          (course.studentProgress.filter((p) => p.status === "completed").length / course.enrollmentCount) * 100,
      })),
      monthlyStats: await this.getMonthlyStats(instructorId),
    }
  }

  async getPlatformAnalytics(): Promise<any> {
    const totalCourses = await this.courseRepository.count()
    const publishedCourses = await this.courseRepository.count({
      where: { status: "published" },
    })

    const totalEnrollments = await this.progressRepository.count()
    const activeStudents = await this.progressRepository.count({
      where: { status: "in_progress" },
    })
    const completedCourses = await this.progressRepository.count({
      where: { status: "completed" },
    })

    // Get revenue data
    const courses = await this.courseRepository.find()
    const totalRevenue = courses.reduce((sum, c) => sum + c.price * c.enrollmentCount, 0)

    // Get top performing courses
    const topCourses = await this.courseRepository.find({
      where: { status: "published" },
      order: { enrollmentCount: "DESC", averageRating: "DESC" },
      take: 10,
    })

    // Get user engagement metrics
    const avgCompletionRate = await this.progressRepository
      .createQueryBuilder("progress")
      .select("AVG(progress.completionPercentage)", "avg")
      .getRawOne()

    return {
      overview: {
        totalCourses,
        publishedCourses,
        totalEnrollments,
        activeStudents,
        completedCourses,
        totalRevenue,
        averageCompletionRate: Number.parseFloat(avgCompletionRate.avg) || 0,
      },
      topCourses: topCourses.map((course) => ({
        id: course.id,
        title: course.title,
        enrollments: course.enrollmentCount,
        rating: course.averageRating,
        revenue: course.price * course.enrollmentCount,
      })),
      growthMetrics: await this.getGrowthMetrics(),
    }
  }

  private calculateDropoffPoints(lessonStats: any[]): any[] {
    const dropoffs = []
    for (let i = 1; i < lessonStats.length; i++) {
      const currentRate = lessonStats[i].completionRate
      const previousRate = lessonStats[i - 1].completionRate
      const dropoff = previousRate - currentRate

      if (dropoff > 10) {
        // Significant dropoff threshold
        dropoffs.push({
          lessonId: lessonStats[i].lessonId,
          title: lessonStats[i].title,
          dropoffPercentage: dropoff,
        })
      }
    }
    return dropoffs.sort((a, b) => b.dropoffPercentage - a.dropoffPercentage)
  }

  private async getMonthlyStats(instructorId: string): Promise<any[]> {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyData = await this.progressRepository
      .createQueryBuilder("progress")
      .leftJoin("progress.course", "course")
      .select([
        "EXTRACT(YEAR FROM progress.enrolledAt) as year",
        "EXTRACT(MONTH FROM progress.enrolledAt) as month",
        "COUNT(*) as enrollments",
        "COUNT(CASE WHEN progress.status = 'completed' THEN 1 END) as completions",
      ])
      .where("course.instructorId = :instructorId", { instructorId })
      .andWhere("progress.enrolledAt >= :sixMonthsAgo", { sixMonthsAgo })
      .groupBy("EXTRACT(YEAR FROM progress.enrolledAt), EXTRACT(MONTH FROM progress.enrolledAt)")
      .orderBy("year, month")
      .getRawMany()

    return monthlyData
  }

  private async getGrowthMetrics(): Promise<any> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const newEnrollments = await this.progressRepository.count({
      where: {
        enrolledAt: { $gte: thirtyDaysAgo } as any,
      },
    })

    const newCourses = await this.courseRepository.count({
      where: {
        createdAt: { $gte: thirtyDaysAgo } as any,
      },
    })

    return {
      newEnrollmentsLast30Days: newEnrollments,
      newCoursesLast30Days: newCourses,
    }
  }
}
