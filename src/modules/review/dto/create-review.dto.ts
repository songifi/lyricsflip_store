import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { ReviewContentType } from '../entities/review.entity';

export class CreateReviewDto {
  @IsInt()
  contentId: number;

  @IsEnum(['album', 'track', 'merchandise', 'event'])
  contentType: ReviewContentType;

  @IsInt()
  @Min(1)
  @Max(5)
  starRating: number;

  @IsString()
  @IsNotEmpty()
  reviewText: string;
}
