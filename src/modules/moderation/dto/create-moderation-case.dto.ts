import { IsEnum, IsString, IsOptional, IsArray, IsNumber, IsBoolean, IsUUID } from "class-validator"
import { ContentType, ViolationType, Priority } from "../entities/moderation-case.entity"

export class CreateModerationCaseDto {
  @IsEnum(ContentType)
  contentType: ContentType

  @IsString()
  contentId: string

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority

  @IsArray()
  @IsEnum(ViolationType, { each: true })
  @IsOptional()
  violationTypes?: ViolationType[]

  @IsString()
  @IsOptional()
  description?: string

  @IsOptional()
  metadata?: Record<string, any>

  @IsNumber()
  @IsOptional()
  confidenceScore?: number

  @IsBoolean()
  @IsOptional()
  isAutomated?: boolean

  @IsUUID()
  @IsOptional()
  reportedByUserId?: string
}
