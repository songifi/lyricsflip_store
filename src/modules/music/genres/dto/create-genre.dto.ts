import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsNumber,
  IsUUID,
  Length,
  Min,
  Max,
  Matches,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GenreMood } from '../enums/genreMood.enum';
import { GenreEnergyLevel } from '../enums/genreEnergyLevel.enum';

export class CreateGenreDto {
  @ApiProperty({ example: 'Alternative Rock' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional({ example: 'A subgenre of rock music that emerged in the 1980s' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '#FF5733' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Color code must be a valid hex color' })
  colorCode?: string;

  @ApiPropertyOptional({ 
    example: ['energetic', 'uplifting'],
    enum: GenreMood,
    isArray: true 
  })
  @IsOptional()
  @IsArray()
  @IsEnum(GenreMood, { each: true })
  moods?: GenreMood[];

  @ApiPropertyOptional({ 
    example: 4,
    enum: GenreEnergyLevel 
  })
  @IsOptional()
  @IsEnum(GenreEnergyLevel)
  energyLevel?: GenreEnergyLevel;

  @ApiPropertyOptional({ example: 'parent-genre-uuid' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ example: ['related-genre-uuid-1', 'related-genre-uuid-2'] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  relatedGenreIds?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: { origin: 'United States', decade: '1980s' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
