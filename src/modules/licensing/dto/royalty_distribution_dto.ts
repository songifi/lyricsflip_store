// src/licensing/dto/royalty-distribution.dto.ts
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDate,
  IsUUID,
  ValidateNested,
  Min,
  Max,
  Length,
  IsObject,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { 
  DistributionStatus, 
  RoyaltyType, 
  PaymentMethod 
} from '../entities/royalty-distribution.entity';

export class DeductionDetailsDto {
  @ApiPropertyOptional({ description: 'Administrative fee' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  adminFee?: number;

  @ApiPropertyOptional({ description: 'Processing fee' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  processingFee?: number;

  @ApiPropertyOptional({ description: 'Tax amount' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  taxes?: number;

  @ApiPropertyOptional({ 
    description: 'Other deductions',
    type: [Object]
  })
  @IsOptional()
  otherDeductions?: Array<{ description: string; amount: number }>;
}

export class UsageDataDto {
  @ApiPropertyOptional({ description: 'Total number of plays' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPlays?: number;

  @ApiPropertyOptional({ description: 'Total number of downloads' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalDownloads?: number;

  @ApiPropertyOptional({ description: 'Total number of streams' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalStreams?: number;

  @ApiPropertyOptional({ description: 'Total broadcast minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  broadcastMinutes?: number;

  @ApiPropertyOptional({ description: 'Usage breakdown by territory' })
  @IsOptional()
  @IsObject()
  territories?: { [territory: string]: number };

  @ApiPropertyOptional({ description: 'Usage breakdown by platform' })
  @IsOptional()
  @IsObject()
  platforms?: { [platform: string]: number };
}

export class PaymentDetailsDto {
  @ApiPropertyOptional({ description: 'Transaction ID' })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({ description: 'Bank reference number' })
  @IsOptional()
  @IsString()
  bankReference?: string;

  @ApiPropertyOptional({ description: 'Processing fee charged' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  processingFee?: number;

  @ApiPropertyOptional({ description: 'Exchange rate used for conversion' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0)
  exchangeRateUsed?: number;

  @ApiPropertyOptional({ description: 'Actual payment date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paymentDate?: Date;
}

export class CreateRoyaltyDistributionDto {
  @ApiProperty({ description: 'Unique distribution identifier' })
  @IsString()
  @Length(1, 255)
  distributionId: string;

  @ApiProperty({ enum: RoyaltyType, description: 'Type of royalty' })
  @IsEnum(RoyaltyType)
  royaltyType: RoyaltyType;

  @ApiProperty({ description: 'Period start date' })
  @IsDate()
  @Type(() => Date)
  periodStart: Date;

  @ApiProperty({ description: 'Period end date' })
  @IsDate()
  @Type(() => Date)
  periodEnd: Date;

  @ApiProperty({ description: 'Gross revenue amount' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  grossRevenue: number;

  @ApiProperty({ description: 'Net revenue amount' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  netRevenue: number;

  @ApiProperty({ description: 'Royalty rate as decimal' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(1)
  royaltyRate: number;

  @ApiProperty({ description: 'Calculated royalty amount' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  royaltyAmount: number;

  @ApiProperty({ description: 'Rights holder ownership share' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(1)
  ownershipShare: number;

  @ApiProperty({ description: 'Final distribution amount' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  distributionAmount: number;

  @ApiPropertyOptional({ description: 'Total deductions' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  deductions?: number;

  @ApiPropertyOptional({ description: 'Deduction details', type: DeductionDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DeductionDetailsDto)
  deductionDetails?: DeductionDetailsDto;

  @ApiProperty({ description: 'Currency code (ISO 4217)' })
  @IsString()
  @Length(3, 3)
  currency: string;

  @ApiPropertyOptional({ description: 'Exchange rate to USD' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0)
  exchangeRate?: number;

  @ApiProperty({ description: 'USD equivalent amount' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  usdEquivalent: number;

  @ApiProperty({ description: 'Usage data', type: UsageDataDto })
  @