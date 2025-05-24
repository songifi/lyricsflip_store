import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  Max,
  Length,
} from 'class-validator';
import { DonationType } from '../../../../database/entities/donation.entity';

export class CreateDonationDto {
  @IsNumber()
  @Min(1)
  @Max(10000)
  amount: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string = 'USD';

  @IsEnum(DonationType)
  type: DonationType;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  message?: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = true;

  @IsString()
  artistId: string;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsString()
  rewardId?: string;

  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  paymentToken?: string;
}