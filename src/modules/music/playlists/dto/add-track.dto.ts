import { IsString, IsOptional, IsNumber, Min } from "class-validator"

export class AddTrackDto {
  @IsString()
  trackId: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number
}
