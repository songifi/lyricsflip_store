import { IsString, IsEnum } from 'class-validator';

export enum Mood {
  CALM = 'calm',
  ENERGETIC = 'energetic',
  SAD = 'sad',
  HAPPY = 'happy',
}

export class UpdateContextDto {
  @IsString()
  trackId: string;

  @IsEnum(Mood)
  mood: Mood;

  @IsString()
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}
