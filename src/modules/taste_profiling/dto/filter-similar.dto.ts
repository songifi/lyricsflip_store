import { IsString } from 'class-validator';

export class FilterSimilarDto {
  @IsString()
  userId: string;
}
