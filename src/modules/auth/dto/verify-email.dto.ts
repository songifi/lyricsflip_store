import { IsNotEmpty, IsString, IsUUID } from "class-validator"

export class VerifyEmailDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  token: string
}
