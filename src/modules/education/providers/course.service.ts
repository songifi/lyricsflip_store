import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Course, CourseStatus } from "../entities/course.entity"
import type { CreateCourseDto } from "../dto/create-course.dto"
import type { UpdateCourseDto } from "../dto/update-course.dto"

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course) private courseRepository: Repository<Course>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.courseRepository.create(createCourseDto)
    return await this.courseRepository.save(course)
  }

  async findAll(filters?: {
    level?: string
    status?: CourseStatus
    instructorId?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<{ courses: Course[]; total: number; page: number; totalPages: number }> {
    const { level, status, instructorId, search, page = 1, limit = 10 } = filters || {}

    const queryBuilder = this.courseRepository
      .createQueryBuilder("course")
      .leftJoinAndSelect("course.instructor", "instructor")
      .leftJoinAndSelect("course.lessons", "lessons")
      .orderBy("course.createdAt", "DESC")

    if (level) {
      queryBuilder.andWhere("course.level = :level", { level })
    }

    if (status) {
      queryBuilder.andWhere("course.status = :status", { status })
    }

    if (instructorId) {
      queryBuilder.andWhere("course.instructorId = :instructorId", { instructorId })
    }

    if (search) {
      queryBuilder.andWhere(
        "(course.title ILIKE :search OR course.description ILIKE :search OR course.tags::text ILIKE :search)",
        { search: `%${search}%` },
      )
    }

    const total = await queryBuilder.getCount()
    const courses = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany()

    return {
      courses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ["instructor", "lessons", "lessons.videos", "lessons.exercises", "lessons.assignments"],
    })

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`)
    }

    return course
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id)
    Object.assign(course, updateCourseDto)
    return await this.courseRepository.save(course)
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id)
    await this.courseRepository.remove(course)
  }

  async publish(id: string): Promise<Course> {
    const course = await this.findOne(id)

    if (course.lessons.length === 0) {
      throw new BadRequestException("Cannot publish course without lessons")
    }

    course.status = CourseStatus.PUBLISHED
    return await this.courseRepository.save(course)
  }

  async archive(id: string): Promise<Course> {
    const course = await this.findOne(id)
    course.status = CourseStatus.ARCHIVED
    return await this.courseRepository.save(course)
  }

  async updateRating(id: string, rating: number): Promise<Course> {
    const course = await this.findOne(id)

    // Calculate new average rating
    const totalRating = course.averageRating * course.reviewCount + rating
    course.reviewCount += 1
    course.averageRating = totalRating / course.reviewCount

    return await this.courseRepository.save(course)
  }

  async incrementEnrollment(id: string): Promise<Course> {
    const course = await this.findOne(id)
    course.enrollmentCount += 1
    return await this.courseRepository.save(course)
  }

  async getPopularCourses(limit = 10): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { status: CourseStatus.PUBLISHED, isActive: true },
      order: { enrollmentCount: "DESC", averageRating: "DESC" },
      take: limit,
      relations: ["instructor"],
    })
  }

  async getRecommendedCourses(userId: string, limit = 5): Promise<Course[]> {
    // This is a simplified recommendation algorithm
    // In a real implementation, you might use machine learning or more sophisticated algorithms
    return await this.courseRepository.find({
      where: { status: CourseStatus.PUBLISHED, isActive: true },
      order: { averageRating: "DESC", enrollmentCount: "DESC" },
      take: limit,
      relations: ["instructor"],
    })
  }
}
