import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsObject,
  IsArray,
  IsNumber,
  Min,
  Max,
  MaxLength,
  ValidateNested,
} from "class-validator"
import { Type } from "class-transformer"
import { PlaylistPrivacy, PlaylistType } from "../../../../database/entities/playlist.entity"

class SmartCriteriaDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  artists?: string[]

  @IsOptional()
  @IsNumber()
  @Min(1)
  minDuration?: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxDuration?: number

  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear())
  minReleaseYear?: number

  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear())
  maxReleaseYear?: number

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mood?: string[]

  @IsOptional()
  @IsObject()
  energy?: { min: number; max: number }

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number
}

export class CreatePlaylistDto {
  @IsString()
  @MaxLength(255)
  name: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string

  @IsOptional()
  @IsString()
  coverImage?: string

  @IsOptional()
  @IsEnum(PlaylistPrivacy)
  privacy?: PlaylistPrivacy

  @IsOptional()
  @IsEnum(PlaylistType)
  type?: PlaylistType

  @IsOptional()
  @IsBoolean()
  isCollaborative?: boolean

  @IsOptional()
  @ValidateNested()
  @Type(() => SmartCriteriaDto)
  smartCriteria?: SmartCriteriaDto
}
