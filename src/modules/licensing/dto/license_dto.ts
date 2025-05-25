// src/licensing/dto/license.dto.ts
import {
  IsString,
  IsEnum,
  IsArray,
  IsDate,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsUUID,
  IsDecimal,
  ValidateNested,
  Min,
  Max,
  Length,
  IsObject,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { LicenseType, LicenseStatus, UsageType } from '../entities/license.entity';

export class UsageLimitsDto {
  @ApiPropertyOptional({ description: 'Maximum number of plays allowed' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPlays?: number;

  @ApiPropertyOptional({ description: 'Maximum number of downloads allowed' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDownloads?: number;

  @ApiPropertyOptional({ description: 'Maximum duration in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDuration?: number;

  @ApiPropertyOptional({ description: 'Exclusivity period in days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  exclusivityPeriod?: number;
}

export class RestrictionsDto {
  @ApiPropertyOptional({ description: 'Geographic restrictions', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  geographicRestrictions?: string[];

  @ApiPropertyOptional({ description: 'Time-based restrictions' })
  @IsOptional()
  @IsString()
  timeRestrictions?: string;

  @ApiPropertyOptional({ description: 'Medium restrictions', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediumRestrictions?: string[];

  @ApiPropertyOptional({ description: 'Purpose restrictions', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  purposeRestrictions?: string[];
}

export class CreateLicenseDto {
  @ApiProperty({ description: 'License title' })
  @IsString()
  @Length(1, 255)
  title: string;

  @ApiPropertyOptional({ description: 'License description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: LicenseType, description: 'Type of license' })
  @IsEnum(LicenseType)
  type: LicenseType;

  @ApiProperty({ enum: UsageType, isArray: true, description: 'Allowed usage types' })
  @IsArray()
  @IsEnum(UsageType, { each: true })
  usageTypes: UsageType[];

  @ApiProperty({ description: 'Music work title' })
  @IsString()
  @Length(1, 255)
  musicWorkTitle: string;

  @ApiProperty({ description: 'Artist name' })
  @IsString()
  @Length(1, 255)
  artist: string;

  @ApiPropertyOptional({ description: 'ISRC code' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  isrc?: string;

  @ApiPropertyOptional({ description: 'ISWC code' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  iswc?: string;

  @ApiProperty({ description: 'License effective date' })
  @IsDate()
  @Type(() => Date)
  effectiveDate: Date;

  @ApiProperty({ description: 'License expiration date' })
  @IsDate()
  @Type(() => Date)
  expirationDate: Date;

  @ApiProperty({ description: 'Territories where license is valid', type: [String] })
  @IsArray()
  @IsString({ each: true })
  territories: string[];

  @ApiProperty({ description: 'Royalty rate as decimal (e.g., 0.0915 for 9.15%)' })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(1)
  royaltyRate: number;

  @ApiPropertyOptional({ description: 'Fixed fee amount' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  fixedFee?: number;

  @ApiPropertyOptional({ description: 'Minimum guarantee amount' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minimumGuarantee?: number;

  @ApiPropertyOptional({ description: 'Advance payment amount' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  advancePayment?: number;

  @ApiPropertyOptional({ description: 'Usage limits', type: UsageLimitsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UsageLimitsDto)
  usageLimits?: UsageLimitsDto;

  @ApiPropertyOptional({ description: 'License restrictions', type: RestrictionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RestrictionsDto)
  restrictions?: RestrictionsDto;

  @ApiPropertyOptional({ description: 'Whether license is exclusive' })
  @IsOptional()
  @IsBoolean()
  isExclusive?: boolean;

  @ApiPropertyOptional({ description: 'Whether license is transferable' })
  @IsOptional()
  @IsBoolean()
  isTransferable?: boolean;

  @ApiPropertyOptional({ description: 'License number' })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  licenseNumber?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Rights holder ID' })
  @IsUUID()
  rightsHolderId: string;
}

export class UpdateLicenseDto extends PartialType(CreateLicenseDto) {
  @ApiPropertyOptional({ enum: LicenseStatus, description: 'License status' })
  @IsOptional()
  @IsEnum(LicenseStatus)
  status?: LicenseStatus;
}

export class LicenseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ enum: LicenseType })
  type: LicenseType;

  @ApiProperty({ enum: LicenseStatus })
  status: LicenseStatus;

  @ApiProperty({ enum: UsageType, isArray: true })
  usageTypes: UsageType[];

  @ApiProperty()
  musicWorkTitle: string;

  @ApiProperty()
  artist: string;

  @ApiPropertyOptional()
  isrc?: string;

  @ApiPropertyOptional()
  iswc?: string;

  @ApiProperty()
  effectiveDate: Date;

  @ApiProperty()
  expirationDate: Date;

  @ApiProperty({ type: [String] })
  territories: string[];

  @ApiProperty()
  royaltyRate: number;

  @ApiPropertyOptional()
  fixedFee?: number;

  @ApiPropertyOptional()
  minimumGuarantee?: number;

  @ApiPropertyOptional()
  advancePayment?: number;

  @ApiPropertyOptional()
  usageLimits?: UsageLimitsDto;

  @ApiPropertyOptional()
  restrictions?: RestrictionsDto;

  @ApiProperty()
  isExclusive: boolean;

  @ApiProperty()
  isTransferable: boolean;

  @ApiPropertyOptional()
  licenseNumber?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  rightsHolderId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class LicenseQueryDto {
  @ApiPropertyOptional({ description: 'Filter by license type', enum: LicenseType })
  @IsOptional()
  @IsEnum(LicenseType)
  type?: LicenseType;

  @ApiPropertyOptional({ description: 'Filter by license status', enum: LicenseStatus })
  @IsOptional()
  @IsEnum(LicenseStatus)
  status?: LicenseStatus;

  @ApiPropertyOptional({ description: 'Filter by rights holder ID' })
  @IsOptional()
  @IsUUID()
  rightsHolderId?: string;

  @ApiPropertyOptional({ description: 'Filter by territory' })
  @IsOptional()
  @IsString()
  territory?: string;

  @ApiPropertyOptional({ description: 'Search in title and music work title' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by expiration date (from)' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expirationFrom?: Date;

  @ApiPropertyOptional({ description: 'Filter by expiration date (to)' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expirationTo?: Date;

  @ApiPropertyOptional({ description: 'Page number for pagination', minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}