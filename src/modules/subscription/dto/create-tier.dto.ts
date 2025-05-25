import { IsNotEmpty, IsNumber, IsArray, IsString } from 'class-validator';

export class CreateTierDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  durationInDays: number;

  @IsArray()
  @IsString({ each: true })
  features: string[];
}
