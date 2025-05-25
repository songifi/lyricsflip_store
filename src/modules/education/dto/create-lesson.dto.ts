import { IsString, IsEnum, IsOptional, IsNumber, IsArray, IsBoolean, Min } from "class-validator"
import { Type } from "class-transformer"
import { LessonType } from "../entities/lesson.entity"

export class CreateLessonDto {
  @IsString()
  title: string

  @IsString()
  description: string

  @IsOptional()
  @IsString()
  content?: string

  @IsEnum(LessonType)
  type: LessonType

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  orderIndex: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  estimatedDurationMinutes?: number

  @IsOptional()
  @IsBoolean()
  isPreview?: boolean

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resources?: string[]

  @IsString()
  courseId: string
}
