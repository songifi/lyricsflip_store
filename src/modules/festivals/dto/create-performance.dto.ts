import {
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  ValidateNested,
  IsArray,
} from "class-validator"
import { Type } from "class-transformer"
import { PerformanceStatus } from "../../../database/entities/performance.entity"

class TechnicalRequirementsDto {
  @ValidateNested()
  soundcheck: {
    duration: number
    requirements: string[]
  }

  @IsArray()
  @IsString({ each: true })
  equipment: string[]

  @IsArray()
  @IsString({ each: true })
  crew: string[]

  @IsArray()
  @IsString({ each: true })
  special: string[]
}

export class CreatePerformanceDto {
  @IsDateString()
  startTime: string

  @IsDateString()
  endTime: string

  @IsOptional()
  @IsNumber()
  durationMinutes?: number

  @IsOptional()
  @IsEnum(PerformanceStatus)
  status?: PerformanceStatus

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => TechnicalRequirementsDto)
  technicalRequirements?: TechnicalRequirementsDto

  @IsOptional()
  @IsNumber()
  fee?: number

  @IsOptional()
  @IsBoolean()
  isHeadliner?: boolean

  @IsString()
  stageId: string

  @IsString()
  artistId: string
}
