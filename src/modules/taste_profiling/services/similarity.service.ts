import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TasteProfile } from '../entities/taste-profile.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SimilarityService {
  constructor(
    @InjectRepository(TasteProfile)
    private readonly repo: Repository<TasteProfile>,
  ) {}

  private cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
  }

  async findSimilar(userId: string): Promise<{ userId: string; similarity: number }[]> {
    const userProfile = await this.repo.findOne({ where: { userId } });
    if (!userProfile) throw new Error('User profile not found');

    const allProfiles = await this.repo.find({ where: { userId: () => `userId != '${userId}'` } });

    return allProfiles.map(profile => ({
      userId: profile.userId,
      similarity: this.cosineSimilarity(userProfile.genreVector, profile.genreVector),
    })).sort((a, b) => b.similarity - a.similarity);
  }
}
