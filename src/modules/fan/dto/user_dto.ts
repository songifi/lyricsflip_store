// src/dto/user.dto.ts
import { IsEmail, IsString, IsOptional, IsArray, IsEnum, IsBoolean, IsDateString, MinLength, MaxLength, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';
import { MusicGenre, SubscriptionTier } from '../entities/user.entity';
import { LibraryItemType, LibraryAction } from '../entities/user-library.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(MusicGenre, { each: true })
  favoriteGenres?: MusicGenre[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favoriteArtists?: string[];
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsBoolean()
  isPublicProfile?: boolean;

  @IsOptional()
  @IsBoolean()
  allowFollowers?: boolean;
}

export class UpdateMusicPreferencesDto {
  @IsArray()
  @IsEnum(MusicGenre, { each: true })
  favoriteGenres: MusicGenre[];

  @IsArray()
  @IsString({ each: true })
  favoriteArtists: string[];
}

export class AddToLibraryDto {
  @IsString()
  itemId: string;

  @IsEnum(LibraryItemType)
  itemType: LibraryItemType;

  @IsOptional()
  @IsEnum(LibraryAction)
  action?: LibraryAction;

  @IsOptional()
  @IsString()
  itemTitle?: string;

  @IsOptional()
  @IsString()
  itemArtist?: string;

  @IsOptional()
  @IsUrl()
  itemCover?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  itemDuration?: number;

  @IsOptional()
  @IsString()
  playlistName?: string;
}

export class FollowUserDto {
  @IsString()
  userId: string;
}

export class FollowArtistDto {
  @IsString()
  artistId: string;

  @IsString()
  artistName: string;

  @IsOptional()
  @IsUrl()
  artistAvatar?: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  birthDate?: Date;
  subscriptionTier: SubscriptionTier;
  favoriteGenres?: MusicGenre[];
  favoriteArtists?: string[];
  isPublicProfile: boolean;
  allowFollowers: boolean;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  createdAt: Date;
  lastLoginAt?: Date;
}

export class UserStatsResponseDto {
  totalListens: number;
  uniqueTracks: number;
  totalMinutes: number;
  topGenres: Array<{
    genre: string;
    playCount: number;
  }>;
  topArtists: Array<{
    artistName: string;
    playCount: number;
  }>;
}

export class YearEndWrapResponseDto {
  year: number;
  totalListens: number;
  totalMinutes: number;
  topTracks: Array<{
    trackId: string;
    trackTitle: string;
    artistName: string;
    playCount: number;
  }>;
  topArtists: Array<{
    artistName: string;
    playCount: number;
  }>;
  topGenres: Array<{
    genre: string;
    playCount: number;
  }>;
  monthlyStats: Array<{
    month: number;
    playCount: number;
    totalMinutes: number;
  }>;
  generatedAt: Date;
}