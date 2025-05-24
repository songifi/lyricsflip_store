import { IsOptional, IsString, IsUrl } from "class-validator";

export class SocialMediaDto {
  @IsOptional()
  @IsString()
  twitter_card?: string;

  @IsOptional()
  @IsUrl()
  og_image?: string;

  @IsOptional()
  @IsString()
  og_description?: string;
}
