import { IsString, IsNumber, IsDate, IsEnum, IsObject, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class RoyaltyBreakdownDto {
  @IsNumber()
  streaming: number;

  @IsNumber()
  downloads: number;

  @IsNumber()
  physical: number;

  @IsNumber()
  sync: number;

  @IsNumber()
  performance: number;
}

export class CreateRoyaltyPaymentDto {
  @IsString()
  contractId: string;

  @IsNumber()
  grossRevenue: number;

  @Type(() => Date)
  @IsDate()
  periodStart: Date;

  @Type(() => Date)
  @IsDate()
  periodEnd: Date;

  @Type(() => Date)
  @IsDate()
  paymentDate: Date;

  @IsObject()
  breakdown: RoyaltyBreakdownDto;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;
}