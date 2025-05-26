import { IsString, IsNumber } from 'class-validator';

export class LogBehaviorDto {
  @IsString()
  trackId: string;

  @IsString()
  genre: string;

  @IsString()
  mood: string;

  @IsNumber()
  tempo: number;
}
