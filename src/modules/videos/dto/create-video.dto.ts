import { IsString, IsOptional, IsEnum, IsBoolean, IsArray, IsUUID, MaxLength } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { VideoType } from "../entities/video.entity"

export class CreateVideoDto {
  @ApiProperty({ description: "Video title", maxLength: 255 })
  @IsString()
  @MaxLength(255)
  title: string

  @ApiPropertyOptional({ description: "Video description" })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ enum: VideoType, description: "Type of video" })
  @IsEnum(VideoType)
  type: VideoType

  @ApiPropertyOptional({ description: "Associated track ID" })
  @IsOptional()
  @IsUUID()
  trackId?: string

  @ApiProperty({ description: "Artist ID" })
  @IsUUID()
  artistId: string

  @ApiPropertyOptional({ description: "SEO title" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string

  @ApiPropertyOptional({ description: "SEO description" })
  @IsOptional()
  @IsString()
  seoDescription?: string

  @ApiPropertyOptional({ description: "SEO keywords" })
  @IsOptional()
  @IsString()
  seoKeywords?: string

  @ApiPropertyOptional({ description: "Video tags" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional({ description: "Is video public", default: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean

  @ApiPropertyOptional({ description: "Is premium content", default: false })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean
}
