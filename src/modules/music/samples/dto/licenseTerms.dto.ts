import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsString,
  IsDateString,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LicenseType } from '../entities/sample-license.entity';

export class LicenseTermsDto {
  @IsBoolean()
  commercialUse: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  distributionLimit?: number;

  @IsBoolean()
  creditRequired: boolean;

  @IsBoolean()
  resaleAllowed: boolean;

  @IsBoolean()
  exclusiveRights: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  royaltyRate?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  territory?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number;

  @IsArray()
  @IsString({ each: true })
  usageTypes: string[];
}

export class CreateLicenseDto {
  @IsEnum(LicenseType)
  type: LicenseType;

  @ValidateNested()
  @Type(() => LicenseTermsDto)
  terms: LicenseTermsDto;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  royaltyRate?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class PurchaseLicenseDto {
  @IsEnum(LicenseType)
  licenseType: LicenseType;

  @IsOptional()
  @ValidateNested()
  @Type(() => LicenseTermsDto)
  customTerms?: LicenseTermsDto;
}