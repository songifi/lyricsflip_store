import { IsArray, IsNumber, IsString } from 'class-validator';

export class CreateTasteProfileDto {
  @IsArray()
  genreVector: number[];

  @IsArray()
  moodVector: number[];

  @IsArray()
  tempoRange: number[];

  @IsNumber()
  artistDiversityScore: number;
}
