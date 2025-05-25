import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsArray, IsDateString, IsUrl } from "class-validator"
import { EpisodeType } from "../../../database/entities/episode.entity"

export class CreateEpisodeDto {
  @IsString()
  title: string

  @IsString()
  description: string

  @IsOptional()
  @IsString()
  summary?: string

  @IsUrl()
  audioUrl: string

  @IsOptional()
  @IsUrl()
  coverImageUrl?: string

  @IsNumber()
  duration: number

  @IsNumber()
  fileSize: number

  @IsString()
  mimeType: string

  @IsOptional()
  @IsEnum(EpisodeType)
  type?: EpisodeType

  @IsOptional()
  @IsNumber()
  episodeNumber?: number

  @IsOptional()
  @IsBoolean()
  explicit?: boolean

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @IsOptional()
  @IsDateString()
  scheduledAt?: string

  @IsOptional()
  @IsString()
  transcript?: string

  @IsOptional()
  @IsString()
  seasonId?: string
}
