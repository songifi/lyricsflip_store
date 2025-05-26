import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TasteProfile } from '../entities/taste-profile.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(TasteProfile)
    private readonly repo: Repository<TasteProfile>,
  ) {}

  async getTopGenres(): Promise<string[]> {
    // Placeholder: aggregate genreVector globally
    const profiles = await this.repo.find();
    const genreCounts: number[] = new Array(10).fill(0);

    profiles.forEach(p => {
      p.genreVector.forEach((val, idx) => {
        genreCounts[idx] += val;
      });
    });

    return genreCounts.map((count, index) => `Genre ${index + 1}: ${count.toFixed(2)}`);
  }

  async suggestFriends(userId: string) {
    // Reuse similarity logic and filter top N
    return `Use SimilarityService to return top 3 similar users for ${userId}`;
  }
}
