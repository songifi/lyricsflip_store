import { IsString, IsDateString, IsOptional, IsBoolean } from "class-validator"

export class CreateRentalDto {
  @IsString()
  gearId: string

  @IsDateString()
  startDate: string

  @IsDateString()
  endDate: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsBoolean()
  insuranceRequired?: boolean
}
