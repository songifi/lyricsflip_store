import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator"

export class CopyrightInfoDto {
  @IsString()
  owner: string

  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear())
  year: number

  @IsOptional()
  @IsString()
  notice?: string
}
