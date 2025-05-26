import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsNumber,
  IsBoolean,
  ValidateNested,
  Min,
  Max,
} from "class-validator"
import { Type } from "class-transformer"
import { ProjectType } from "../entities/project.entity"

class ProjectSettingsDto {
  @IsBoolean()
  isPublic: boolean

  @IsBoolean()
  allowInvites: boolean

  @IsBoolean()
  requireApproval: boolean

  @IsNumber()
  @Min(1)
  @Max(50)
  maxMembers: number

  @IsArray()
  @IsString({ each: true })
  genres: string[]

  @IsArray()
  @IsString({ each: true })
  tags: string[]
}

class ProjectMetadataDto {
  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(200)
  bpm?: number

  @IsOptional()
  @IsString()
  key?: string

  @IsOptional()
  @IsString()
  timeSignature?: string

  @IsOptional()
  @IsString()
  genre?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mood?: string[]
}

export class CreateProjectDto {
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsEnum(ProjectType)
  type: ProjectType

  @IsOptional()
  @IsDateString()
  deadline?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectSettingsDto)
  settings?: ProjectSettingsDto

  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectMetadataDto)
  metadata?: ProjectMetadataDto
}
