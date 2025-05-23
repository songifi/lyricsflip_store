import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator"
import { ArtistRole } from "src/modules/artists/enums/artistRole.enum"

export class RegisterArtistDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  artisticName?: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string

  @IsEnum(ArtistRole)
  @IsNotEmpty()
  role: ArtistRole

  @IsOptional()
  @IsString()
  bio?: string
}
