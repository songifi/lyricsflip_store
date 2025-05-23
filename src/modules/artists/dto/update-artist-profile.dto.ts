import { IsEmail, IsOptional, IsString, IsUrl, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

class SocialLinksDto {
  @IsOptional()
  @IsUrl()
  instagram?: string

  @IsOptional()
  @IsUrl()
  twitter?: string

  @IsOptional()
  @IsUrl()
  facebook?: string

  @IsOptional()
  @IsUrl()
  youtube?: string

  @IsOptional()
  @IsUrl()
  spotify?: string

  @IsOptional()
  @IsUrl()
  soundcloud?: string

  @IsOptional()
  @IsUrl()
  appleMusic?: string
}

export class UpdateArtistProfileDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  artisticName?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  bio?: string

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsUrl()
  website?: string

  @IsOptional()
  @IsString({ each: true })
  genres?: string[]

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto
}
