import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsObject, Min, Max } from "class-validator"
import { FeedbackType } from "../entities/feedback.entity"

export class AddFeedbackDto {
  @IsEnum(FeedbackType)
  type: FeedbackType

  @IsString()
  content: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  timestamp?: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number

  @IsOptional()
  @IsString()
  parentFeedbackId?: string

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  attachments?: {
    name: string
    url: string
    type: string
  }[]
}
