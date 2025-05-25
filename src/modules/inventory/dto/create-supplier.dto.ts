import { IsString, IsEmail, IsOptional, IsNumber, Min, Max, IsBoolean } from "class-validator"

export class CreateSupplierDto {
  @IsString()
  name: string

  @IsEmail()
  email: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  contactPerson?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
