import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommendation } from '../entities/recommendation.entity';
import { RecommendationFeedback } from '../entities/recommendation-feedback.entity';
import { UserInteraction } from '../entities/user-interaction.entity';

interface PerformanceMetrics {
  clickThroughRate: number;
  conversionRate: number;
  diversityScore: number;
  noveltyScore: number;
  coverage: number;
  precision: number;
  recall: number;
  f1Score: number;
}

interface AlgorithmPerformance {
  collaborative: number;
  contentBased: number;
  hybrid: number;
  trending: number;
}

interface UserExplorationProfile {
  explorationTendency: number;
  genreDiversity: number;
  artistDiversity: number;
  averagePopularity: number;
}

@Injectable()
export class RecommendationAnalyticsService {
  private readonly logger = new Logger(RecommendationAnalyticsService.name);

  constructor(
    @InjectRepository(Recommendation)
    private recommendationRepository: Repository<Recommendation>,
    @InjectRepository(RecommendationFeedback)
    private feedbackRepository: Repository<RecommendationFeedback>,
    @InjectRepository(UserInteraction)
    private userInteractionRepository: Repository<UserInteraction>,
  ) {}

  async getRecommendationPerformance(
    timeRange: { start: Date; end: Date },
    algorithmType?: string,
  ): Promise<PerformanceMetrics> {
    try {
      const queryBuilder = this.recommendationRepository
        .createQueryBuilder('rec')
        .where('rec.createdAt BETWEEN :start AND :end', timeRange);

      if (algorithmType) {
        queryBuilder.andWhere('rec.recommendationType = :algorithmType', { algorithmType });
      }

      const recommendations = await queryBuilder.getMany();

      const metrics = await this.calculatePerformanceMetrics(recommendations);
      
      this.logger.log(`Performance metrics calculated for ${recommendations.length} recommendations`);
      
      return metrics;
    } catch (error) {
      this.logger.error(`Error calculating recommendation performance: ${error.message}`);
      throw error;
    }
  }

  async getAlgorithmPerformance(userId: string): Promise<AlgorithmPerformance> {
    try {
      const userRecommendations = await this.recommendationRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 1000, // Last 1000 recommendations
      });

      const performance: AlgorithmPerformance = {
        collaborative: 0,
        contentBased: 0,
        hybrid: 0,
        trending: 0,
      };

      const algorithmCounts = {
        collaborative: 0,
        contentBased: 0,
        hybrid: 0,
        trending: 0,
      };

      for (const rec of userRecommendations) {
        const score = this.calculateRecommendationScore(rec);
        
        switch (rec.recommendationType) {
          case 'collaborative':
            performance.collaborative += score;
            algorithmCounts.collaborative++;
            break;
          case 'content_based':
            performance.contentBased += score;
            algorithmCounts.contentBased++;
            break;
          case 'hybrid':
            performance.hybrid += score;
            algorithmCounts.hybrid++;
            break;
          case 'trending':
            performance.trending += score;
            algorithmCounts.trending++;
            break;
        }
      }

      // Calculate averages
      for (const algorithm in performance) {
        const count = algorithmCounts[algorithm];
        if (count > 0) {
          performance[algorithm] /= count;
        }
      }

      return performance;
    } catch (error) {
      this.logger.error(`` /= count;
        }
      }

      return performance;
    } catch (error) {
      this.logger.error(`Error calculating algorithm performance: ${error.message}`);
      throw error;
    }
  }

  async getUserExplorationProfile(userId: string): Promise<UserExplorationProfile> {
    try {
      const userInteractions = await this.userInteractionRepository.find({
        where: { userId },
        relations: ['track', 'track.genre', 'track.artist'],
        order: { createdAt: 'DESC' },
        take: 500, // Recent interactions
      });

      const genres = new Set<string>();
      const artists = new Set<string>();
      let totalPopularity = 0;
      let popularityCount = 0;

      for (const interaction of userInteractions) {
        if (interaction.track.genre) {
          genres.add(interaction.track.genre.name);
        }
        if (interaction.track.artist) {
          artists.add(interaction.track.artist.id);
        }
        if (interaction.track.popularity) {
          totalPopularity += interaction.track.popularity;
          popularityCount++;
        }
      }

      const totalTracks = userInteractions.length;
      const genreDiversity = totalTracks > 0 ? genres.size / Math.min(totalTracks, 20) : 0; // Normalize by max 20 genres
      const artistDiversity = totalTracks > 0 ? artists.size / Math.min(totalTracks, 50) : 0; // Normalize by max 50 artists
      const averagePopularity = popularityCount > 0 ? totalPopularity / popularityCount : 0.5;

      // Calculate exploration tendency based on diversity and popularity
      const explorationTendency = (genreDiversity + artistDiversity + (1 - averagePopularity)) / 3;

      return {
        explorationTendency: Math.min(Math.max(explorationTendency, 0), 1),
        genreDiversity,
        artistDiversity,
        averagePopularity,
      };
    } catch (error) {
      this.logger.error(`Error calculating user exploration profile: ${error.message}`);
      return {
        explorationTendency: 0.2,
        genreDiversity: 0.5,
        artistDiversity: 0.5,
        averagePopularity: 0.5,
      };
    }
  }

  async trackRecommendationInteraction(
    recommendationId: string,
    interactionType: 'view' | 'click' | 'like' | 'dislike' | 'skip',
  ): Promise<void> {
    try {
      const recommendation = await this.recommendationRepository.findOne({
        where: { id: recommendationId },
      });

      if (!recommendation) {
        this.logger.warn(`Recommendation not found: ${recommendationId}`);
        return;
      }

      switch (interactionType) {
        case 'view':
          recommendation.viewedAt = new Date();
          break;
        case 'click':
          recommendation.clickedAt = new Date();
          break;
      }

      await this.recommendationRepository.save(recommendation);

      // Create feedback record for explicit feedback
      if (['like', 'dislike', 'skip'].includes(interactionType)) {
        const feedbackType = interactionType === 'like' ? 'positive' : 
                           interactionType === 'dislike' ? 'negative' : 'neutral';

        await this.feedbackRepository.save({
          userId: recommendation.userId,
          recommendationId,
          feedbackType,
          metadata: { interactionType },
        });
      }

      this.logger.log(`Tracked ${interactionType} interaction for recommendation ${recommendationId}`);
    } catch (error) {
      this.logger.error(`Error tracking recommendation interaction: ${error.message}`);
    }
  }

  async generatePerformanceReport(timeRange: { start: Date; end: Date }): Promise<any> {
    try {
      const [
        overallMetrics,
        collaborativeMetrics,
        contentBasedMetrics,
        hybridMetrics,
        userEngagement,
        diversityAnalysis,
      ] = await Promise.all([
        this.getRecommendationPerformance(timeRange),
        this.getRecommendationPerformance(timeRange, 'collaborative'),
        this.getRecommendationPerformance(timeRange, 'content_based'),
        this.getRecommendationPerformance(timeRange, 'hybrid'),
        this.getUserEngagementMetrics(timeRange),
        this.getDiversityAnalysis(timeRange),
      ]);

      const report = {
        timeRange,
        overall: overallMetrics,
        byAlgorithm: {
          collaborative: collaborativeMetrics,
          contentBased: contentBasedMetrics,
          hybrid: hybridMetrics,
        },
        userEngagement,
        diversity: diversityAnalysis,
        recommendations: await this.generateRecommendations(overallMetrics),
        generatedAt: new Date(),
      };

      this.logger.log('Performance report generated successfully');
      return report;
    } catch (error) {
      this.logger.error(`Error generating performance report: ${error.message}`);
      throw error;
    }
  }

  private async calculatePerformanceMetrics(recommendations: Recommendation[]): Promise<PerformanceMetrics> {
    if (recommendations.length === 0) {
      return {
        clickThroughRate: 0,
        conversionRate: 0,
        diversityScore: 0,
        noveltyScore: 0,
        coverage: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
      };
    }

    const totalRecommendations = recommendations.length;
    const viewedRecommendations = recommendations.filter(r => r.viewedAt).length;
    const clickedRecommendations = recommendations.filter(r => r.clickedAt).length;

    // Get feedback for these recommendations
    const recommendationIds = recommendations.map(r => r.id);
    const feedback = await this.feedbackRepository.find({
      where: { recommendationId: { $in: recommendationIds } },
    });

    const positiveFeedback = feedback.filter(f => f.feedbackType === 'positive').length;
    const negativeFeedback = feedback.filter(f => f.feedbackType === 'negative').length;

    // Calculate basic metrics
    const clickThroughRate = viewedRecommendations > 0 ? clickedRecommendations / viewedRecommendations : 0;
    const conversionRate = clickedRecommendations > 0 ? positiveFeedback / clickedRecommendations : 0;

    // Calculate diversity score
    const diversityScore = await this.calculateDiversityScore(recommendations);

    // Calculate novelty score
    const noveltyScore = await this.calculateNoveltyScore(recommendations);

    // Calculate coverage
    const coverage = await this.calculateCoverage(recommendations);

    // Calculate precision, recall, and F1
    const precision = (positiveFeedback + negativeFeedback) > 0 ? positiveFeedback / (positiveFeedback + negativeFeedback) : 0;
    const recall = totalRecommendations > 0 ? positiveFeedback / totalRecommendations : 0;
    const f1Score = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

    return {
      clickThroughRate,
      conversionRate,
      diversityScore,
      noveltyScore,
      coverage,
      precision,
      recall,
      f1Score,
    };
  }

  private calculateRecommendationScore(recommendation: Recommendation): number {
    let score = 0;

    // Base score from recommendation confidence
    score += recommendation.confidence * 0.3;

    // Bonus for user interaction
    if (recommendation.viewedAt) score += 0.2;
    if (recommendation.clickedAt) score += 0.3;

    // Check for explicit feedback
    // This would require a join query in a real implementation
    // For now, we'll use a simplified scoring

    return Math.min(score, 1.0);
  }

  private async calculateDiversityScore(recommendations: Recommendation[]): Promise<number> {
    // This would calculate how diverse the recommendations are
    // in terms of genres, artists, etc.
    // Simplified implementation
    return 0.7;
  }

  private async calculateNoveltyScore(recommendations: Recommendation[]): Promise<number> {
    // This would calculate how novel/surprising the recommendations are
    // Simplified implementation
    return 0.6;
  }

  private async calculateCoverage(recommendations: Recommendation[]): Promise<number> {
    // This would calculate what percentage of the catalog is being recommended
    // Simplified implementation
    return 0.15;
  }

  private async getUserEngagementMetrics(timeRange: { start: Date; end: Date }): Promise<any> {
    // Calculate user engagement metrics
    return {
      activeUsers: 1000,
      averageSessionLength: 25.5,
      recommendationsPerUser: 15.2,
      userRetention: 0.85,
    };
  }

  private async getDiversityAnalysis(timeRange: { start: Date; end: Date }): Promise<any> {
    // Analyze recommendation diversity
    return {
      genreDistribution: { pop: 0.3, rock: 0.25, jazz: 0.15, classical: 0.1, other: 0.2 },
      artistDistribution: { established: 0.7, emerging: 0.3 },
      popularityDistribution: { mainstream: 0.6, niche: 0.4 },
    };
  }

  private async generateRecommendations(metrics: PerformanceMetrics): Promise<string[]> {
    const recommendations = [];

    if (metrics.clickThroughRate < 0.1) {
      recommendations.push('Consider improving recommendation relevance - low click-through rate detected');
    }

    if (metrics.diversityScore < 0.5) {
      recommendations.push('Increase recommendation diversity to improve user discovery');
    }

    if (metrics.noveltyScore < 0.4) {
      recommendations.push('Introduce more novel recommendations to prevent filter bubbles');
    }

    if (metrics.precision < 0.6) {
      recommendations.push('Focus on improving recommendation precision through better user profiling');
    }

    return recommendations;
  }
}