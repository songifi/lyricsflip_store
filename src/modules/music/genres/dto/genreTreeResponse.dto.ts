import { GenreResponseDto } from "./genre-response.dto";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenreTreeResponseDto {
  @ApiProperty({ type: [GenreResponseDto] })
  genres: GenreResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}