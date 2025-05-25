import { IsString, IsNotEmpty } from 'class-validator';

export class ArtistResponseDto {
  @IsString()
  @IsNotEmpty()
  responseText: string;
}
