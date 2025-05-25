import { IsString, IsEnum, IsOptional, IsNumber, IsArray, Min } from "class-validator"
import { Type } from "class-transformer"
import { CourseLevel } from "../entities/course.entity"

export class CreateCourseDto {
  @IsString()
  title: string

  @IsString()
  description: string

  @IsOptional()
  @IsString()
  shortDescription?: string

  @IsOptional()
  @IsString()
  thumbnailUrl?: string

  @IsOptional()
  @IsString()
  previewVideoUrl?: string

  @IsEnum(CourseLevel)
  level: CourseLevel

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  estimatedDurationMinutes?: number

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningObjectives?: string[]

  @IsString()
  instructorId: string
}
