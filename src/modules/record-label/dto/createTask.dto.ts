import { IsString, IsOptional, IsEnum, IsDate, IsNumber, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsObject()
  metadata?: {
    category?: string;
    tags?: string[];
    attachments?: string[];
  };
}