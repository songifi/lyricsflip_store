import { IsUUID, IsInt, IsEnum, IsOptional, IsString, IsArray, IsNumber, Min, Max } from "class-validator"
import { SessionStatus } from "../../../database/entities/meditation-session.entity"

export class CreateMeditationSessionDto {
  @IsUUID()
  programId: string

  @IsUUID()
  @IsOptional()
  trackId?: string

  @IsInt()
  @Min(1)
  sessionNumber: number

  @IsInt()
  @Min(1)
  @Max(180)
  plannedDurationMinutes: number

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  moodBefore?: number

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  stressBefore?: number

  @IsArray()
  @IsOptional()
  techniques?: string[]
}

export class UpdateMeditationSessionDto {
  @IsEnum(SessionStatus)
  @IsOptional()
  status?: SessionStatus

  @IsInt()
  @Min(0)
  @IsOptional()
  actualDurationMinutes?: number

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  moodAfter?: number

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  stressAfter?: number

  @IsString()
  @IsOptional()
  notes?: string

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  completionPercentage?: number
}
