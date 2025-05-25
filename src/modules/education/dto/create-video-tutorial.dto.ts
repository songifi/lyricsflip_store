import { IsString, IsEnum, IsOptional, IsNumber, IsArray, Min } from "class-validator"
import { Type } from "class-transformer"
import { VideoQuality } from "../entities/video-tutorial.entity"

export class CreateVideoTutorialDto {
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsString()
  videoUrl: string

  @IsOptional()
  @IsString()
  thumbnailUrl?: string

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  durationSeconds?: number

  @IsOptional()
  @IsEnum(VideoQuality)
  quality?: VideoQuality

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  fileSize?: number

  @IsOptional()
  @IsString()
  streamingUrl?: string

  @IsOptional()
  @IsArray()
  chapters?: Array<{
    title: string
    startTime: number
    endTime: number
  }>

  @IsOptional()
  @IsArray()
  subtitles?: Array<{
    language: string
    url: string
  }>

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  orderIndex?: number

  @IsString()
  lessonId: string
}
