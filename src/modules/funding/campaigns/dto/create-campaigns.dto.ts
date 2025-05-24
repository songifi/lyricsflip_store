import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  IsDateString,
  ValidateNested,
  Min,
  Max,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CampaignType } from '../../../../database/entities/funding-campaign.entity';

class RewardDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @Length(1, 100)
  title: string;

  @IsString()
  @Length(1, 500)
  description: string;

  @IsOptional()
  @IsString()
  estimatedDelivery?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limitedQuantity?: number;
}

class MilestoneDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @Length(1, 100)
  title: string;

  @IsString()
  @Length(1, 500)
  description: string;
}

export class CreateCampaignDto {
  @IsString()
  @Length(1, 255)
  title: string;

  @IsString()
  @Length(1, 2000)
  description: string;

  @IsEnum(CampaignType)
  type: CampaignType;

  @IsNumber()
  @Min(1)
  @Max(1000000)
  goalAmount: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videos?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RewardDto)
  rewards?: RewardDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  milestones?: MilestoneDto[];

  @IsOptional()
  @IsBoolean()
  allowTips?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  albumId?: string;
}