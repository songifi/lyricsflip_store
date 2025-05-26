import { IsEnum, IsUUID, IsNumber, IsOptional, IsString, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { RightsType, OwnershipType } from '../entities/rights.entity';

export class CreateRightsDto {
  @IsEnum(RightsType)
  rightsType: RightsType;

  @IsEnum(OwnershipType)
  ownershipType: OwnershipType;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(1)
  @Type(() => Number)
  ownershipPercentage: number;

  @IsUUID()
  ownerId: string;

  @IsOptional()
  @IsUUID()
  trackId?: string;

  @IsOptional()
  @IsUUID()
  albumId?: string;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  territory?: string;

  @IsOptional()
  restrictions?: Record<string, any>;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  isrcCode?: string;

  @IsOptional()
  @IsString()
  iswcCode?: string;
}