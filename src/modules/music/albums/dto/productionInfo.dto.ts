import { IsArray, IsOptional, IsString } from "class-validator";

export class ProductionInfoDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  producer?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  engineer?: string[];

  @IsOptional()
  @IsString()
  studio?: string;

  @IsOptional()
  @IsString()
  recorded_at?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mixed_by?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mastered_by?: string[];
}