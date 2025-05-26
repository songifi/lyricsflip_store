import { IsOptional, IsEnum, IsString, IsNumber, IsDateString, IsUUID } from "class-validator"
import { Type } from "class-transformer"
import { ApiPropertyOptional } from "@nestjs/swagger"
import { SyncLicenseStatus, MediaType } from "../../../database/entities/sync-license.entity"

export class SyncLicenseQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ enum: SyncLicenseStatus })
  @IsOptional()
  @IsEnum(SyncLicenseStatus)
  status?: SyncLicenseStatus

  @ApiPropertyOptional({ enum: MediaType })
  @IsOptional()
  @IsEnum(MediaType)
  mediaType?: MediaType

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clientId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string
}
