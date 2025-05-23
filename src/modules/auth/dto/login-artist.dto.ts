import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class LoginArtistDto {
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  password: string
}
