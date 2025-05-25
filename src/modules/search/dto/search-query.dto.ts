import { IsOptional, IsString, IsNumber } from 'class-validator';

export class SearchQueryDto {
  @IsString() query: string;

  @IsOptional() @IsString() genre?: string;
  @IsOptional() @IsNumber() year?: number;
  @IsOptional() @IsNumber() priceMin?: number;
  @IsOptional() @IsNumber() priceMax?: number;
  @IsOptional() @IsString() location?: string;
}
