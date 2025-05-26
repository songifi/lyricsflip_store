import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TasteEvolution } from '../entities/taste-evolution.entity';
import { Repository } from 'typeorm';
import { TasteProfile } from '../entities/taste-profile.entity';

@Injectable()
export class EvolutionService {
  constructor(
    @InjectRepository(TasteEvolution)
    private readonly evolutionRepo: Repository<TasteEvolution>,
    @InjectRepository(TasteProfile)
    private readonly profileRepo: Repository<TasteProfile>,
  ) {}

  async snapshot(userId: string): Promise<TasteEvolution> {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new Error('Taste profile not found');

    const evolution = this.evolutionRepo.create({
      userId,
      genreSnapshot: profile.genreVector,
      moodSnapshot: profile.moodVector,
      tempoSnapshot: profile.tempoRange,
    });

    return this.evolutionRepo.save(evolution);
  }

  async getTimeline(userId: string): Promise<TasteEvolution[]> {
    return this.evolutionRepo.find({
      where: { userId },
      order: { capturedAt: 'ASC' },
    });
  }
}
