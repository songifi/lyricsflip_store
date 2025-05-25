import { IsEnum, IsString, IsOptional, IsUUID } from "class-validator"
import { ContentType, ViolationType } from "../entities/moderation-case.entity"

export class FlagContentDto {
  @IsEnum(ContentType)
  contentType: ContentType

  @IsString()
  contentId: string

  @IsEnum(ViolationType)
  violationType: ViolationType

  @IsString()
  @IsOptional()
  reason?: string

  @IsUUID()
  reportedByUserId: string
}
