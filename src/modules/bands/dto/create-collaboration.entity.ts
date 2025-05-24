import { IsString, IsEnum, IsOptional, IsDateString, IsObject, IsArray } from 'class-validator';
import { CollaborationType } from '../../../database/entities/collaboration.entity';

export class CreateCollaborationDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(CollaborationType)
  type: CollaborationType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsObject()
  terms?: {
    revenueShare?: Record<string, number>;
    responsibilities?: Record<string, string[]>;
    deadlines?: Record<string, Date>;
    budget?: number;
  };

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  inviteUserIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  inviteBandIds?: string[];
}