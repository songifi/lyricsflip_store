import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ReviewContentType } from '../entities/review.entity';

export class UpdateReviewDto {
  @IsOptional()
  @IsInt()
  contentId?: number;

  @IsOptional()
  @IsEnum(['album', 'track', 'merchandise', 'event'])
  contentType?: ReviewContentType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  starRating?: number;

  @IsOptional()
  @IsString()
  reviewText?: string;
}
