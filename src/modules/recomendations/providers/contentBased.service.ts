import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserInteraction } from '../entities/user-interaction.entity';
import { Track } from '../../music/tracks/entities/track.entity';

interface ContentFeatures {
  genres: string[];
  artists: string[];
  tempo?: number;
  energy?: number;
  valence?: number;
  acousticness?: number;
  danceability?: number;
  instrumentalness?: number;
  speechiness?: number;
  duration?: number;
}

interface ContentRecommendation {
  trackId: string;
  score: number;
  explanation: Record<string, any>;
}

@Injectable()
export class ContentBasedService {
  private readonly logger = new Logger(ContentBasedService.name);

  constructor(
    @InjectRepository(UserInteraction)
    private userInteractionRepository: Repository<UserInteraction>,
    @InjectRepository(Track)
    private trackRepository: Repository<Track>,
  ) {}

  async generateContentBasedRecommendations(
    userId: string,
    limit: number = 20,
  ): Promise<ContentRecommendation[]> {
    try {
      // Build user profile from interaction history
      const userProfile = await this.buildUserProfile(userId);
      
      // Get candidate tracks (excluding already interacted)
      const candidateTracks = await this.getCandidateTracks(userId);
      
      // Score tracks based on content similarity
      const recommendations = await this.scoreTracksByContent(
        userProfile,
        candidateTracks,
        limit,
      );

      return recommendations;
    } catch (error) {
      this.logger.error(`Error generating content-based recommendations: ${error.message}`);
      return [];
    }
  }

  private async buildUserProfile(userId: string): Promise<ContentFeatures> {
    const interactions = await this.userInteractionRepository.find({
      where: { userId },
      relations: ['track', 'track.genre', 'track.artist'],
      order: { createdAt: 'DESC' },
      take: 100, // Consider recent interactions
    });

    const profile: ContentFeatures = {
      genres: [],
      artists: [],
    };

    const genreWeights = new Map<string, number>();
    const artistWeights = new Map<string, number>();
    const audioFeatures = {
      tempo: [],
      energy: [],
      valence: [],
      acousticness: [],
      danceability: [],
      instrumentalness: [],
      speechiness: [],
      duration: [],
    };

    for (const interaction of interactions) {
      const weight = this.getInteractionWeight(interaction.interactionType);
      const track = interaction.track;

      // Genre preferences
      if (track.genre) {
        const currentWeight = genreWeights.get(track.genre.name) || 0;
        genreWeights.set(track.genre.name, currentWeight + weight);
      }

      // Artist preferences
      if (track.artist) {
        const currentWeight = artistWeights.get(track.artist.id) || 0;
        artistWeights.set(track.artist.id, currentWeight + weight);
      }

      // Audio features (if available)
      if (track.audioFeatures) {
        const features = track.audioFeatures;
        if (features.tempo) audioFeatures.tempo.push(features.tempo * weight);
        if (features.energy) audioFeatures.energy.push(features.energy * weight);
        if (features.valence) audioFeatures.valence.push(features.valence * weight);
        if (features.acousticness) audioFeatures.acousticness.push(features.acousticness * weight);
        if (features.danceability) audioFeatures.danceability.push(features.danceability * weight);
        if (features.instrumentalness) audioFeatures.instrumentalness.push(features.instrumentalness * weight);
        if (features.speechiness) audioFeatures.speechiness.push(features.speechiness * weight);
      }

      if (track.duration) {
        audioFeatures.duration.push(track.duration * weight);
      }
    }

    // Convert to profile
    profile.genres = Array.from(genreWeights.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([genre]) => genre);

    profile.artists = Array.from(artistWeights.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([artistId]) => artistId);

    // Calculate average audio features
    for (const [feature, values] of Object.entries(audioFeatures)) {
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        profile[feature] = sum / values.length;
      }
    }

    return profile;
  }

  private async getCandidateTracks(userId: string): Promise<Track[]> {
    // Get tracks user hasn't interacted with
    const interactedTrackIds = await this.userInteractionRepository
      .createQueryBuilder('interaction')
      .select('interaction.trackId')
      .where('interaction.userId = :userId', { userId })
      .getRawMany()
      .then(results => results.map(r => r.interaction_trackId));

    const queryBuilder = this.trackRepository
      .createQueryBuilder('track')
      .leftJoinAndSelect('track.genre', 'genre')
      .leftJoinAndSelect('track.artist', 'artist')
      .where('track.isActive = :isActive', { isActive: true });

    if (interactedTrackIds.length > 0) {
      queryBuilder.andWhere('track.id NOT IN (:...interactedTrackIds)', {
        interactedTrackIds,
      });
    }

    return queryBuilder
      .orderBy('track.createdAt', 'DESC')
      .take(1000) // Limit candidate pool
      .getMany();
  }

  private async scoreTracksByContent(
    userProfile: ContentFeatures,
    candidateTracks: Track[],
    limit: number,
  ): Promise<ContentRecommendation[]> {
    const recommendations: ContentRecommendation[] = [];

    for (const track of candidateTracks) {
      const score = this.calculateContentSimilarity(userProfile, track);
      
      if (score > 0.1) { // Minimum threshold
        const explanation = this.generateContentExplanation(userProfile, track, score);
        
        recommendations.push({
          trackId: track.id,
          score,
          explanation,
        });
      }
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private calculateContentSimilarity(userProfile: ContentFeatures, track: Track): number {
    let score = 0;
    let totalWeight = 0;

    // Genre similarity
    if (track.genre && userProfile.genres.includes(track.genre.name)) {
      const genreIndex = userProfile.genres.indexOf(track.genre.name);
      const genreScore = 1 - (genreIndex / userProfile.genres.length);
      score += genreScore * 0.3;
      totalWeight += 0.3;
    }

    // Artist similarity
    if (track.artist && userProfile.artists.includes(track.artist.id)) {
      const artistIndex = userProfile.artists.indexOf(track.artist.id);
      const artistScore = 1 - (artistIndex / userProfile.artists.length);
      score += artistScore * 0.2;
      totalWeight += 0.2;
    }

    // Audio features similarity
    if (track.audioFeatures && userProfile.tempo) {
      const audioScore = this.calculateAudioFeaturesSimilarity(userProfile, track.audioFeatures);
      score += audioScore * 0.4;
      totalWeight += 0.4;
    }

    // Duration similarity
    if (track.duration && userProfile.duration) {
      const durationDiff = Math.abs(track.duration - userProfile.duration);
      const maxDuration = Math.max(track.duration, userProfile.duration);
      const durationScore = 1 - (durationDiff / maxDuration);
      score += durationScore * 0.1;
      totalWeight += 0.1;
    }

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  private calculateAudioFeaturesSimilarity(
    userProfile: ContentFeatures,
    trackFeatures: any,
  ): number {
    const features = ['tempo', 'energy', 'valence', 'acousticness', 'danceability', 'instrumentalness', 'speechiness'];
    let similarity = 0;
    let count = 0;

    for (const feature of features) {
      if (userProfile[feature] !== undefined && trackFeatures[feature] !== undefined) {
        const userValue = userProfile[feature];
        const trackValue = trackFeatures[feature];
        
        // Normalize tempo differently (it's not 0-1 scale)
        if (feature === 'tempo') {
          const diff = Math.abs(userValue - trackValue);
          const maxTempo = Math.max(userValue, trackValue, 200); // Assume max tempo of 200
          similarity += 1 - (diff / maxTempo);
        } else {
          // For 0-1 scale features
          similarity += 1 - Math.abs(userValue - trackValue);
        }
        count++;
      }
    }

    return count > 0 ? similarity / count : 0;
  }

  private generateContentExplanation(
    userProfile: ContentFeatures,
    track: Track,
    score: number,
  ): Record<string, any> {
    const reasons = [];

    if (track.genre && userProfile.genres.includes(track.genre.name)) {
      reasons.push(`You like ${track.genre.name} music`);
    }

    if (track.artist && userProfile.artists.includes(track.artist.id)) {
      reasons.push(`You've enjoyed music by ${track.artist.name}`);
    }

    if (track.audioFeatures) {
      if (userProfile.energy && Math.abs(userProfile.energy - track.audioFeatures.energy) < 0.2) {
        reasons.push('Similar energy level to your preferences');
      }
      if (userProfile.valence && Math.abs(userProfile.valence - track.audioFeatures.valence) < 0.2) {
        reasons.push('Matches your mood preferences');
      }
    }

    return {
      type: 'content_based',
      score,
      confidence: Math.min(score, 1),
      reasons: reasons.slice(0, 3),
      matchedGenres: track.genre && userProfile.genres.includes(track.genre.name) ? [track.genre.name] : [],
      matchedArtists: track.artist && userProfile.artists.includes(track.artist.id) ? [track.artist.name] : [],
    };
  }

  private getInteractionWeight(interactionType: string): number {
    const weights = {
      'like': 5,
      'add_to_playlist': 4,
      'download': 4,
      'share': 3,
      'play': 2,
      'skip': -1,
      'dislike': -3,
    };

    return weights[interactionType] || 1;
  }
}