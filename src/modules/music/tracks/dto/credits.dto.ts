import { IsArray, IsOptional, IsString } from "class-validator"

export class CreditsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  composers?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lyricists?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  producers?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  engineers?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  performers?: string[]
}
