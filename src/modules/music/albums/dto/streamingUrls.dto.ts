import { IsOptional, IsUrl } from "class-validator";

export class StreamingUrlsDto {
  @IsOptional()
  @IsUrl()
  spotify?: string;

  @IsOptional()
  @IsUrl()
  apple_music?: string;

  @IsOptional()
  @IsUrl()
  youtube_music?: string;

  @IsOptional()
  @IsUrl()
  amazon_music?: string;

  @IsOptional()
  @IsUrl()
  tidal?: string;

  @IsOptional()
  @IsUrl()
  deezer?: string;
}
