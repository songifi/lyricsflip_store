
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { Genre } from '../entities/genre.entity';
import { GenreMood } from '../enums/genreMood.enum';
import { GenreEnergyLevel } from '../enums/genreEnergyLevel.enum';

@Injectable()
export class GenreSeederService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: TreeRepository<Genre>,
  ) {}

  async seedGenres(): Promise<void> {
    // Check if genres already exist
    const existingCount = await this.genreRepository.count();
    if (existingCount > 0) {
      console.log('Genres already seeded');
      return;
    }

    console.log('Seeding genres...');

    // Create root genres
    const rock = await this.createGenre({
      name: 'Rock',
      description: 'A broad genre of popular music that originated as "rock and roll"',
      colorCode: '#FF6B35',
      moods: [GenreMood.ENERGETIC, GenreMood.AGGRESSIVE],
      energyLevel: GenreEnergyLevel.HIGH,
    });

    const electronic = await this.createGenre({
      name: 'Electronic',
      description: 'Music that employs electronic musical instruments and technology',
      colorCode: '#00D4FF',
      moods: [GenreMood.ENERGETIC, GenreMood.EUPHORIC],
      energyLevel: GenreEnergyLevel.HIGH,
    });

    const hiphop = await this.createGenre({
      name: 'Hip Hop',
      description: 'A cultural movement that includes rap music, DJing, and breakdancing',
      colorCode: '#FFD23F',
      moods: [GenreMood.AGGRESSIVE, GenreMood.UPLIFTING],
      energyLevel: GenreEnergyLevel.HIGH,
    });

    const pop = await this.createGenre({
      name: 'Pop',
      description: 'Popular music that appeals to a wide audience',
      colorCode: '#FF69B4',
      moods: [GenreMood.UPLIFTING, GenreMood.ROMANTIC],
      energyLevel: GenreEnergyLevel.MODERATE,
    });

    const jazz = await this.createGenre({
      name: 'Jazz',
      description: 'A music genre that originated in African-American communities',
      colorCode: '#8B4513',
      moods: [GenreMood.PEACEFUL, GenreMood.NOSTALGIC],
      energyLevel: GenreEnergyLevel.MODERATE,
    });

    const classical = await this.createGenre({
      name: 'Classical',
      description: 'Art music produced in the traditions of Western culture',
      colorCode: '#800080',
      moods: [GenreMood.PEACEFUL, GenreMood.MYSTERIOUS],
      energyLevel: GenreEnergyLevel.LOW,
    });

    // Create Rock subgenres
    await this.createGenre({
      name: 'Alternative Rock',
      description: 'A category of rock music that emerged in the 1980s',
      colorCode: '#FF4500',
      moods: [GenreMood.ENERGETIC, GenreMood.MELANCHOLIC],
      energyLevel: GenreEnergyLevel.HIGH,
      parent: rock,
    });

    const metal = await this.createGenre({
      name: 'Metal',
      description: 'A genre of rock music that developed in the late 1960s',
      colorCode: '#2F2F2F',
      moods: [GenreMood.AGGRESSIVE, GenreMood.DARK],
      energyLevel: GenreEnergyLevel.VERY_HIGH,
      parent: rock,
    });

    await this.createGenre({
      name: 'Punk Rock',
      description: 'A music genre that emerged in the mid-1970s',
      colorCode: '#FF1493',
      moods: [GenreMood.AGGRESSIVE, GenreMood.ENERGETIC],
      energyLevel: GenreEnergyLevel.VERY_HIGH,
      parent: rock,
    });

    // Create Metal subgenres
    await this.createGenre({
      name: 'Death Metal',
      description: 'An extreme subgenre of heavy metal music',
      colorCode: '#8B0000',
      moods: [GenreMood.AGGRESSIVE, GenreMood.DARK],
      energyLevel: GenreEnergyLevel.VERY_HIGH,
      parent: metal,
    });

    await this.createGenre({
      name: 'Black Metal',
      description: 'An extreme subgenre of heavy metal music',
      colorCode: '#000000',
      moods: [GenreMood.DARK, GenreMood.MYSTERIOUS],
      energyLevel: GenreEnergyLevel.VERY_HIGH,
      parent: metal,
    });

    // Create Electronic subgenres
    await this.createGenre({
      name: 'House',
      description: 'A genre of electronic dance music',
      colorCode: '#00CED1',
      moods: [GenreMood.EUPHORIC, GenreMood.ENERGETIC],
      energyLevel: GenreEnergyLevel.HIGH,
      parent: electronic,
    });

    await this.createGenre({
      name: 'Techno',
      description: 'A genre of electronic dance music',
      colorCode: '#4169E1',
      moods: [GenreMood.ENERGETIC, GenreMood.MYSTERIOUS],
      energyLevel: GenreEnergyLevel.HIGH,
      parent: electronic,
    });

    await this.createGenre({
      name: 'Ambient',
      description: 'A genre of music that emphasizes tone and atmosphere',
      colorCode: '#9370DB',
      moods: [GenreMood.PEACEFUL, GenreMood.MYSTERIOUS],
      energyLevel: GenreEnergyLevel.VERY_LOW,
      parent: electronic,
    });

    // Create Hip Hop subgenres
    await this.createGenre({
      name: 'Trap',
      description: 'A subgenre of hip hop music',
      colorCode: '#FF4500',
      moods: [GenreMood.AGGRESSIVE, GenreMood.ENERGETIC],
      energyLevel: GenreEnergyLevel.HIGH,
      parent: hiphop,
    });

    await this.createGenre({
      name: 'Old School Hip Hop',
      description: 'The earliest commercially recorded hip hop music',
      colorCode: '#DAA520',
      moods: [GenreMood.UPLIFTING, GenreMood.NOSTALGIC],
      energyLevel: GenreEnergyLevel.MODERATE,
      parent: hiphop,
    });

    // Create Pop subgenres
    await this.createGenre({
      name: 'Synthpop',
      description: 'A subgenre of new wave music',
      colorCode: '#FF1493',
      moods: [GenreMood.UPLIFTING, GenreMood.NOSTALGIC],
      energyLevel: GenreEnergyLevel.MODERATE,
      parent: pop,
    });

    await this.createGenre({
      name: 'Teen Pop',
      description: 'A subgenre of pop music targeted at teenagers',
      colorCode: '#FFB6C1',
      moods: [GenreMood.UPLIFTING, GenreMood.ROMANTIC],
      energyLevel: GenreEnergyLevel.MODERATE,
      parent: pop,
    });

    // Create Jazz subgenres
    await this.createGenre({
      name: 'Bebop',
      description: 'A style of jazz developed in the 1940s',
      colorCode: '#CD853F',
      moods: [GenreMood.ENERGETIC, GenreMood.MYSTERIOUS],
      energyLevel: GenreEnergyLevel.HIGH,
      parent: jazz,
    });

    await this.createGenre({
      name: 'Smooth Jazz',
      description: 'A genre of commercially oriented crossover jazz',
      colorCode: '#DEB887',
      moods: [GenreMood.PEACEFUL, GenreMood.ROMANTIC],
      energyLevel: GenreEnergyLevel.LOW,
      parent: jazz,
    });

    console.log('Genres seeded successfully');
  }

  private async createGenre(data: {
    name: string;
    description: string;
    colorCode: string;
    moods: GenreMood[];
    energyLevel: GenreEnergyLevel;
    parent?: Genre;
  }): Promise<Genre> {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const genre = this.genreRepository.create({
      ...data,
      slug,
      isActive: true,
      isFeatured: false,
      popularity: Math.random() * 100, // Random initial popularity
    });

    return this.genreRepository.save(genre);
  }
}