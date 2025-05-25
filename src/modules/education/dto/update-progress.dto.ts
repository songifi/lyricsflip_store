import { IsOptional, IsNumber, IsEnum, IsDate, Min, Max } from "class-validator"
import { Type } from "class-transformer"
import { ProgressStatus } from "../entities/student-progress.entity"

export class UpdateProgressDto {
  @IsOptional()
  @IsEnum(ProgressStatus)
  status?: ProgressStatus

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  completionPercentage?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  lessonsCompleted?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  exercisesCompleted?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  assignmentsCompleted?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  totalTimeSpentMinutes?: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  totalScore?: number

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastAccessedAt?: Date

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  completedAt?: Date
}
