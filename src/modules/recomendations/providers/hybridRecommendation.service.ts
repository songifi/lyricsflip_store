import { Injectable, Logger } from '@nestjs/common';
import { CollaborativeFilteringService } from './collaborative-filtering.service';
import { ContentBasedService } from './content-based.service';
import { RecommendationAnalyticsService } from './recommendation-analytics.service';

interface HybridRecommendation {
  trackId: string;
  score: number;
  confidence: number;
  explanation: Record<string, any>;
  sources: string[];
}

interface AlgorithmWeight {
  collaborative: number;
  contentBased: number;
  trending: number;
  diversity: number;
}

@Injectable()
export class HybridRecommendationService {
  private readonly logger = new Logger(HybridRecommendationService.name);

  constructor(
    private collaborativeFilteringService: CollaborativeFilteringService,
    private contentBasedService: ContentBasedService,
    private analyticsService: RecommendationAnalyticsService,
  ) {}

  async generateHybridRecommendations(
    userId: string,
    limit: number = 20,
    weights?: Partial<AlgorithmWeight>,
  ): Promise<HybridRecommendation[]> {
    try {
      // Get user-specific algorithm weights
      const algorithmWeights = await this.getAlgorithmWeights(userId, weights);
      
      // Generate recommendations from different algorithms
      const [collaborativeRecs, contentBasedRecs, trendingRecs] = await Promise.all([
        this.collaborativeFilteringService.generateUserBasedRecommendations(userId, limit * 2),
        this.contentBasedService.generateContentBasedRecommendations(userId, limit * 2),
        this.getTrendingRecommendations(userId, limit),
      ]);

      // Combine and weight recommendations
      const combinedRecommendations = this.combineRecommendations(
        collaborativeRecs,
        contentBasedRecs,
        trendingRecs,
        algorithmWeights,
      );

      // Apply diversity and novelty filters
      const diversifiedRecommendations = await this.applyDiversityFilter(
        combinedRecommendations,
        userId,
        limit,
      );

      // Add exploration vs exploitation balance
      const finalRecommendations = await this.balanceExplorationExploitation(
        diversifiedRecommendations,
        userId,
        limit,
      );

      return finalRecommendations;
    } catch (error) {
      this.logger.error(`Error generating hybrid recommendations: ${error.message}`);
      return [];
    }
  }

  private async getAlgorithmWeights(
    userId: string,
    customWeights?: Partial<AlgorithmWeight>,
  ): Promise<AlgorithmWeight> {
    // Get user's historical performance for different algorithms
    const performance = await this.analyticsService.getAlgorithmPerformance(userId);
    
    // Default weights
    let weights: AlgorithmWeight = {
      collaborative: 0.4,
      contentBased: 0.3,
      trending: 0.2,
      diversity: 0.1,
    };

    // Adjust weights based on performance
    if (performance.collaborative > performance.contentBased) {
      weights.collaborative += 0.1;
      weights.contentBased -= 0.1;
    } else {
      weights.contentBased += 0.1;
      weights.collaborative -= 0.1;
    }

    // Apply custom weights if provided
    if (customWeights) {
      weights = { ...weights, ...customWeights };
    }

    // Normalize weights to sum to 1
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    for (const key in weights) {
      weights[key] /= totalWeight;
    }

    return weights;
  }

  private combineRecommendations(
    collaborativeRecs: any[],
    contentBasedRecs: any[],
    trendingRecs: any[],
    weights: AlgorithmWeight,
  ): Map<string, HybridRecommendation> {
    const combinedMap = new Map<string, HybridRecommendation>();

    // Process collaborative filtering recommendations
    for (const rec of collaborativeRecs) {
      const weightedScore = rec.score * weights.collaborative;
      combinedMap.set(rec.trackId, {
        trackId: rec.trackId,
        score: weightedScore,
        confidence: rec.explanation.confidence * weights.collaborative,
        explanation: {
          ...rec.explanation,
          hybridComponents: ['collaborative'],
        },
        sources: ['collaborative'],
      });
    }

    // Process content-based recommendations
    for (const rec of contentBasedRecs) {
      const weightedScore = rec.score * weights.contentBased;
      
      if (combinedMap.has(rec.trackId)) {
        const existing = combinedMap.get(rec.trackId);
        existing.score += weightedScore;
        existing.confidence += rec.explanation.confidence * weights.contentBased;
        existing.sources.push('content_based');
        existing.explanation.hybridComponents.push('content_based');
        existing.explanation.contentReasons = rec.explanation.reasons;
      } else {
        combinedMap.set(rec.trackId, {
          trackId: rec.trackId,
          score: weightedScore,
          confidence: rec.explanation.confidence * weights.contentBased,
          explanation: {
            ...rec.explanation,
            hybridComponents: ['content_based'],
          },
          sources: ['content_based'],
        });
      }
    }

    // Process trending recommendations
    for (const rec of trendingRecs) {
      const weightedScore = rec.score * weights.trending;
      
      if (combinedMap.has(rec.trackId)) {
        const existing = combinedMap.get(rec.trackId);
        existing.score += weightedScore;
        existing.confidence += 0.8 * weights.trending; // Trending has high confidence
        existing.sources.push('trending');
        existing.explanation.hybridComponents.push('trending');
      } else {
        combinedMap.set(rec.trackId, {
          trackId: rec.trackId,
          score: weightedScore,
          confidence: 0.8 * weights.trending,
          explanation: {
            type: 'hybrid',
            hybridComponents: ['trending'],
            trendingReason: 'Popular among users with similar taste',
          },
          sources: ['trending'],
        });
      }
    }

    return combinedMap;
  }

  private async applyDiversityFilter(
    recommendations: Map<string, HybridRecommendation>,
    userId: string,
    limit: number,
  ): Promise<HybridRecommendation[]> {
    const recsArray = Array.from(recommendations.values())
      .sort((a, b) => b.score - a.score);

    const diversifiedRecs: HybridRecommendation[] = [];
    const selectedGenres = new Set<string>();
    const selectedArtists = new Set<string>();

    // Get track metadata for diversity calculation
    const trackMetadata = await this.getTrackMetadata(
      recsArray.map(r => r.trackId),
    );

    for (const rec of recsArray) {
      if (diversifiedRecs.length >= limit) break;

      const track = trackMetadata.get(rec.trackId);
      if (!track) continue;

      // Check diversity constraints
      const genreCount = selectedGenres.size;
      const artistCount = selectedArtists.size;
      
      const isNewGenre = track.genre && !selectedGenres.has(track.genre);
      const isNewArtist = track.artist && !selectedArtists.has(track.artist);

      // Promote diversity in early recommendations
      const diversityBonus = diversifiedRecs.length < limit * 0.3 && (isNewGenre || isNewArtist) ? 0.1 : 0;
      
      // Penalize over-representation
      const genrePenalty = track.genre && selectedGenres.has(track.genre) && genreCount > 3 ? -0.05 : 0;
      const artistPenalty = track.artist && selectedArtists.has(track.artist) && artistCount > 2 ? -0.1 : 0;

      rec.score += diversityBonus + genrePenalty + artistPenalty;

      diversifiedRecs.push(rec);

      // Update diversity tracking
      if (track.genre) selectedGenres.add(track.genre);
      if (track.artist) selectedArtists.add(track.artist);
    }

    return diversifiedRecs.sort((a, b) => b.score - a.score);
  }

  private async balanceExplorationExploitation(
    recommendations: HybridRecommendation[],
    userId: string,
    limit: number,
  ): Promise<HybridRecommendation[]> {
    // Get user's exploration tendency
    const userProfile = await this.analyticsService.getUserExplorationProfile(userId);
    
    const explorationRatio = userProfile.explorationTendency || 0.2; // Default 20% exploration
    const explorationCount = Math.floor(limit * explorationRatio);
    const exploitationCount = limit - explorationCount;

    // Split recommendations into exploitation (high confidence) and exploration (diverse/novel)
    const highConfidenceRecs = recommendations
      .filter(r => r.confidence > 0.7)
      .slice(0, exploitationCount);

    const explorationRecs = recommendations
      .filter(r => r.confidence <= 0.7 || r.sources.includes('trending'))
      .slice(0, explorationCount);

    // Combine and shuffle to avoid predictable patterns
    const finalRecs = [...highConfidenceRecs, ...explorationRecs];
    
    // Add exploration/exploitation labels to explanations
    finalRecs.forEach((rec, index) => {
      if (index < exploitationCount) {
        rec.explanation.recommendationType = 'exploitation';
        rec.explanation.reason = 'Based on your established preferences';
      } else {
        rec.explanation.recommendationType = 'exploration';
        rec.explanation.reason = 'Discover something new';
      }
    });

    return this.shuffleRecommendations(finalRecs);
  }

  private shuffleRecommendations(recommendations: HybridRecommendation[]): HybridRecommendation[] {
    // Implement a controlled shuffle that maintains some score-based ordering
    // while introducing variety
    const shuffled = [...recommendations];
    
    // Shuffle in groups to maintain relative quality
    const groupSize = 5;
    for (let i = 0; i < shuffled.length; i += groupSize) {
      const group = shuffled.slice(i, i + groupSize);
      for (let j = group.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [group[j], group[k]] = [group[k], group[j]];
      }
      shuffled.splice(i, groupSize, ...group);
    }

    return shuffled;
  }

  private async getTrendingRecommendations(userId: string, limit: number): Promise<any[]> {
    // This would typically query trending tracks based on recent interactions
    // For now, return empty array - implement based on your analytics
    return [];
  }

  private async getTrackMetadata(trackIds: string[]): Promise<Map<string, any>> {
    // This would fetch track metadata including genre, artist, etc.
    // Return empty map for now - implement based on your track entity structure
    return new Map();
  }
}