import { IsString, IsNumber, IsOptional, IsUrl } from "class-validator"

export class CreateChapterDto {
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsNumber()
  startTime: number

  @IsNumber()
  endTime: number

  @IsOptional()
  @IsUrl()
  imageUrl?: string

  @IsOptional()
  @IsUrl()
  url?: string

  @IsNumber()
  chapterNumber: number
}
