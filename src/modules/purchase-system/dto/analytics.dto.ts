import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export enum Timeframe {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export class RevenueByTimeframeDto {
  @IsEnum(Timeframe)
  timeframe: Timeframe;

  @IsOptional()
  @IsString()
  artistId?: string;
}

export class ArtistAnalyticsDto {
  @IsString()
  artistId: string;
}

export class TopSellingItemsDto {
  @IsOptional()
  @IsEnum(Timeframe)
  timeframe?: Timeframe;

  @IsOptional()
  @IsString()
  artistId?: string;
}
