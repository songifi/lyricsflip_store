import { IsOptional, IsString, IsUUID, IsEnum, IsBoolean, IsNumber, Min, Max } from "class-validator"
import { Transform, Type } from "class-transformer"
import { TrackStatus } from "../enums/trackStatus.enum"
import { AudioFormat } from "../enums/audioFormat.enum"

export class TrackQueryDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsUUID()
  artistId?: string

  @IsOptional()
  @IsUUID()
  albumId?: string

  @IsOptional()
  @IsUUID()
  genreId?: string

  @IsOptional()
  @IsEnum(TrackStatus)
  status?: TrackStatus

  @IsOptional()
  @IsEnum(AudioFormat)
  format?: AudioFormat

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true")
  isExplicit?: boolean

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true")
  allowDownload?: boolean

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20

  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt"

  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC" = "DESC"
}
