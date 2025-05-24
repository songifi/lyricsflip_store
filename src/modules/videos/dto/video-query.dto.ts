import { IsOptional, IsEnum, IsString, IsBoolean, IsInt, Min, Max } from "class-validator"
import { Transform, Type } from "class-transformer"
import { ApiPropertyOptional } from "@nestjs/swagger"
import { VideoType, VideoStatus } from "../entities/video.entity"

export class VideoQueryDto {
  @ApiPropertyOptional({ description: "Page number", minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ description: "Items per page", minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20

  @ApiPropertyOptional({ enum: VideoType, description: "Filter by video type" })
  @IsOptional()
  @IsEnum(VideoType)
  type?: VideoType

  @ApiPropertyOptional({ enum: VideoStatus, description: "Filter by video status" })
  @IsOptional()
  @IsEnum(VideoStatus)
  status?: VideoStatus

  @ApiPropertyOptional({ description: "Filter by artist ID" })
  @IsOptional()
  @IsString()
  artistId?: string

  @ApiPropertyOptional({ description: "Filter by track ID" })
  @IsOptional()
  @IsString()
  trackId?: string

  @ApiPropertyOptional({ description: "Search term" })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ description: "Show only public videos", default: true })
  @IsOptional()
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  isPublic?: boolean = true

  @ApiPropertyOptional({ description: "Show only featured videos" })
  @IsOptional()
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  isFeatured?: boolean

  @ApiPropertyOptional({ description: "Sort by field", enum: ["createdAt", "viewCount", "title"] })
  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt"

  @ApiPropertyOptional({ description: "Sort order", enum: ["ASC", "DESC"] })
  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC" = "DESC"
}
