import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CopyrightInfoDto {
  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 10)
  copyright_year?: number;

  @IsOptional()
  @IsString()
  copyright_holder?: string;

  @IsOptional()
  @IsString()
  publishing_rights?: string;

  @IsOptional()
  @IsString()
  mechanical_rights?: string;
}
