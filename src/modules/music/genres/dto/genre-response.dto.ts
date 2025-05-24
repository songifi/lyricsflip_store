import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GenreMood } from '../enums/genreMood.enum';
import { GenreEnergyLevel } from '../enums/genreEnergyLevel.enum';

export class GenreResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  colorCode?: string;

  @ApiProperty({ enum: GenreMood, isArray: true })
  moods: GenreMood[];

  @ApiProperty({ enum: GenreEnergyLevel })
  energyLevel: GenreEnergyLevel;

  @ApiProperty()
  popularity: number;

  @ApiProperty()
  trackCount: number;

  @ApiProperty()
  albumCount: number;

  @ApiProperty()
  artistCount: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isFeatured: boolean;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ type: GenreResponseDto })
  parent?: Partial<GenreResponseDto> | null;

  @ApiPropertyOptional({ type: [GenreResponseDto] })
  children?: GenreResponseDto[];

  @ApiPropertyOptional({ type: [GenreResponseDto] })
  relatedGenres?: GenreResponseDto[];

  @ApiProperty()
  level: number;

  @ApiProperty()
  fullPath: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}