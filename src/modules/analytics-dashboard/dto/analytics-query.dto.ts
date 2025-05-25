import { IsOptional, IsDateString, IsEnum, IsUUID, IsInt, Min, Max } from "class-validator"
import { Transform, Type } from "class-transformer"
import { ApiPropertyOptional } from "@nestjs/swagger"

export enum AnalyticsTimeRange {
  LAST_7_DAYS = "last_7_days",
  LAST_30_DAYS = "last_30_days",
  LAST_90_DAYS = "last_90_days",
  LAST_YEAR = "last_year",
  CUSTOM = "custom",
}

export enum AnalyticsMetric {
  STREAMS = "streams",
  REVENUE = "revenue",
  ENGAGEMENT = "engagement",
  DEMOGRAPHICS = "demographics",
  GEOGRAPHIC = "geographic",
}

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ enum: AnalyticsTimeRange })
  @IsOptional()
  @IsEnum(AnalyticsTimeRange)
  timeRange?: AnalyticsTimeRange = AnalyticsTimeRange.LAST_30_DAYS

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  artistId?: string

  @ApiPropertyOptional({ enum: AnalyticsMetric, isArray: true })
  @IsOptional()
  @IsEnum(AnalyticsMetric, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  metrics?: AnalyticsMetric[]

  @ApiPropertyOptional({ minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0
}
