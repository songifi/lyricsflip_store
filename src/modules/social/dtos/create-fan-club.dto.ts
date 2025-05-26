import { IsString, IsOptional } from 'class-validator';

export class CreateFanClubDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
