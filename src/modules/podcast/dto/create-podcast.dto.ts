import { IsString, IsEnum, IsOptional, IsBoolean, IsArray, IsEmail, IsUrl } from "class-validator"
import { PodcastCategory } from "../../../database/entities/podcast.entity"

export class CreatePodcastDto {
  @IsString()
  title: string

  @IsString()
  description: string

  @IsOptional()
  @IsString()
  summary?: string

  @IsOptional()
  @IsUrl()
  coverImageUrl?: string

  @IsEnum(PodcastCategory)
  category: PodcastCategory

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @IsOptional()
  @IsString()
  language?: string

  @IsOptional()
  @IsBoolean()
  explicit?: boolean

  @IsOptional()
  @IsUrl()
  website?: string

  @IsOptional()
  @IsEmail()
  contactEmail?: string

  @IsOptional()
  @IsString()
  author?: string

  @IsOptional()
  @IsString()
  copyright?: string
}
