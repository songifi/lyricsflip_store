import { IsOptional, IsString, IsBoolean, IsEnum, IsArray, IsNumber, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { GenreMood } from '../enums/genreMood.enum';
import { GenreEnergyLevel } from '../enums/genreEnergyLevel.enum';

export class GenreQueryDto {
  @ApiPropertyOptional({ example: 'rock' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: ['energetic', 'uplifting'], enum: GenreMood, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(GenreMood, { each: true })
  moods?: GenreMood[];

  @ApiPropertyOptional({ example: 4, enum: GenreEnergyLevel })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(GenreEnergyLevel)
  energyLevel?: GenreEnergyLevel;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  maxLevel?: number;

  @ApiPropertyOptional({ example: 'parent-genre-uuid' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'name' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'name';

  @ApiPropertyOptional({ example: 'ASC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}