import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from "@nestjs/common"
import type { CourseService } from "../services/course.service"
import type { CreateCourseDto } from "../dto/create-course.dto"
import type { UpdateCourseDto } from "../dto/update-course.dto"
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../../auth/guards/roles.guard"
import { Roles } from "../../auth/decorators/roles.decorator"
import { UserRole } from "../../users/entities/user.entity"

@Controller("education/courses")
@UseGuards(JwtAuthGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  create(@Body() createCourseDto: CreateCourseDto, @Request() req: any) {
    // Ensure instructor can only create courses for themselves
    if (req.user.role === UserRole.INSTRUCTOR) {
      createCourseDto.instructorId = req.user.id
    }
    return this.courseService.create(createCourseDto)
  }

  @Get()
  findAll(@Query() filters: any) {
    return this.courseService.findAll(filters);
  }

  @Get('popular')
  getPopular(@Query('limit') limit?: number) {
    return this.courseService.getPopularCourses(limit);
  }

  @Get("recommended")
  getRecommended(@Request() req, @Query('limit') limit?: number) {
    return this.courseService.getRecommendedCourses(req.user.id, limit)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(id, updateCourseDto)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.courseService.remove(id);
  }

  @Post(':id/publish')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  publish(@Param('id') id: string) {
    return this.courseService.publish(id);
  }

  @Post(':id/archive')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  archive(@Param('id') id: string) {
    return this.courseService.archive(id);
  }

  @Post(":id/enroll")
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  async enroll(@Param('id') id: string, @Request() req) {
    // This would typically involve payment processing
    // For now, we'll just increment enrollment
    return this.courseService.incrementEnrollment(id)
  }

  @Post(":id/rate")
  rate(@Param('id') id: string, @Body('rating') rating: number) {
    return this.courseService.updateRating(id, +id, rating)
  }
}
