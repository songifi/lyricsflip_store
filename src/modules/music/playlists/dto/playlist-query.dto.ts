import { IsOptional, IsEnum, IsString, IsNumber, Min, Max, IsBoolean } from "class-validator"
import { Type } from "class-transformer"
import { PlaylistPrivacy, PlaylistType } from "../../../../database/entities/playlist.entity"

export class PlaylistQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsEnum(PlaylistPrivacy)
  privacy?: PlaylistPrivacy

  @IsOptional()
  @IsEnum(PlaylistType)
  type?: PlaylistType

  @IsOptional()
  @IsString()
  createdBy?: string

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isCollaborative?: boolean

  @IsOptional()
  @IsString()
  sortBy?: "createdAt" | "updatedAt" | "name" | "followersCount" | "playsCount"

  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC"
}
