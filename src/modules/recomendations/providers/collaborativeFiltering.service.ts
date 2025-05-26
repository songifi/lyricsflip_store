import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserInteraction, InteractionType } from '../entities/user-interaction.entity';
import { Matrix } from 'ml-matrix';

interface UserSimilarity {
  userId: string;
  similarity: number;
}

interface ItemRecommendation {
  trackId: string;
  score: number;
  explanation: Record<string, any>;
}

@Injectable()
export class CollaborativeFilteringService {
  private readonly logger = new Logger(CollaborativeFilteringService.name);

  constructor(
    @InjectRepository(UserInteraction)
    private userInteractionRepository: Repository<UserInteraction>,
  ) {}

  async generateUserBasedRecommendations(
    userId: string,
    limit: number = 20,
  ): Promise<ItemRecommendation[]> {
    try {
      // Get user interaction matrix
      const userItemMatrix = await this.buildUserItemMatrix();
      
      // Find similar users
      const similarUsers = await this.findSimilarUsers(userId, userItemMatrix);
      
      // Generate recommendations based on similar users
      const recommendations = await this.generateRecommendationsFromSimilarUsers(
        userId,
        similarUsers,
        limit,
      );

      return recommendations;
    } catch (error) {
      this.logger.error(`Error generating user-based recommendations: ${error.message}`);
      return [];
    }
  }

  async generateItemBasedRecommendations(
    userId: string,
    limit: number = 20,
  ): Promise<ItemRecommendation[]> {
    try {
      // Get user's interaction history
      const userInteractions = await this.getUserInteractions(userId);
      
      // Build item similarity matrix
      const itemSimilarityMatrix = await this.buildItemSimilarityMatrix();
      
      // Generate recommendations based on item similarities
      const recommendations = await this.generateRecommendationsFromItemSimilarity(
        userInteractions,
        itemSimilarityMatrix,
        limit,
      );

      return recommendations;
    } catch (error) {
      this.logger.error(`Error generating item-based recommendations: ${error.message}`);
      return [];
    }
  }

  private async buildUserItemMatrix(): Promise<Map<string, Map<string, number>>> {
    const interactions = await this.userInteractionRepository.find({
      relations: ['user', 'track'],
    });

    const matrix = new Map<string, Map<string, number>>();

    for (const interaction of interactions) {
      if (!matrix.has(interaction.userId)) {
        matrix.set(interaction.userId, new Map<string, number>());
      }

      const userMap = matrix.get(interaction.userId);
      const currentRating = userMap.get(interaction.trackId) || 0;
      
      // Weight different interaction types
      const weight = this.getInteractionWeight(interaction.interactionType);
      userMap.set(interaction.trackId, currentRating + weight);
    }

    return matrix;
  }

  private async findSimilarUsers(
    targetUserId: string,
    userItemMatrix: Map<string, Map<string, number>>,
    topK: number = 50,
  ): Promise<UserSimilarity[]> {
    const targetUserRatings = userItemMatrix.get(targetUserId);
    if (!targetUserRatings) return [];

    const similarities: UserSimilarity[] = [];

    for (const [userId, userRatings] of userItemMatrix) {
      if (userId === targetUserId) continue;

      const similarity = this.calculateCosineSimilarity(targetUserRatings, userRatings);
      if (similarity > 0) {
        similarities.push({ userId, similarity });
      }
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  private calculateCosineSimilarity(
    ratingsA: Map<string, number>,
    ratingsB: Map<string, number>,
  ): number {
    const commonItems = new Set([...ratingsA.keys()].filter(x => ratingsB.has(x)));
    
    if (commonItems.size === 0) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const item of commonItems) {
      const ratingA = ratingsA.get(item) || 0;
      const ratingB = ratingsB.get(item) || 0;
      
      dotProduct += ratingA * ratingB;
      normA += ratingA * ratingA;
      normB += ratingB * ratingB;
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private async generateRecommendationsFromSimilarUsers(
    userId: string,
    similarUsers: UserSimilarity[],
    limit: number,
  ): Promise<ItemRecommendation[]> {
    const userInteractions = await this.getUserInteractions(userId);
    const userTrackIds = new Set(userInteractions.map(i => i.trackId));

    const recommendations = new Map<string, { score: number; contributors: string[] }>();

    for (const { userId: similarUserId, similarity } of similarUsers) {
      const similarUserInteractions = await this.getUserInteractions(similarUserId);
      
      for (const interaction of similarUserInteractions) {
        if (userTrackIds.has(interaction.trackId)) continue;

        const weight = this.getInteractionWeight(interaction.interactionType);
        const score = similarity * weight;

        if (recommendations.has(interaction.trackId)) {
          const existing = recommendations.get(interaction.trackId);
          existing.score += score;
          existing.contributors.push(similarUserId);
        } else {
          recommendations.set(interaction.trackId, {
            score,
            contributors: [similarUserId],
          });
        }
      }
    }

    return Array.from(recommendations.entries())
      .map(([trackId, { score, contributors }]) => ({
        trackId,
        score,
        explanation: {
          type: 'collaborative_filtering',
          method: 'user_based',
          similarUsers: contributors.slice(0, 5),
          confidence: Math.min(score / 10, 1),
        },
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async buildItemSimilarityMatrix(): Promise<Map<string, Map<string, number>>> {
    // This would typically be pre-computed and cached
    const interactions = await this.userInteractionRepository.find();
    const itemUserMatrix = new Map<string, Map<string, number>>();

    // Build item-user matrix
    for (const interaction of interactions) {
      if (!itemUserMatrix.has(interaction.trackId)) {
        itemUserMatrix.set(interaction.trackId, new Map<string, number>());
      }

      const itemMap = itemUserMatrix.get(interaction.trackId);
      const weight = this.getInteractionWeight(interaction.interactionType);
      itemMap.set(interaction.userId, weight);
    }

    // Calculate item similarities
    const similarityMatrix = new Map<string, Map<string, number>>();
    const items = Array.from(itemUserMatrix.keys());

    for (let i = 0; i < items.length; i++) {
      const itemA = items[i];
      similarityMatrix.set(itemA, new Map<string, number>());

      for (let j = i + 1; j < items.length; j++) {
        const itemB = items[j];
        const similarity = this.calculateCosineSimilarity(
          itemUserMatrix.get(itemA),
          itemUserMatrix.get(itemB),
        );

        if (similarity > 0.1) { // Threshold for similarity
          similarityMatrix.get(itemA).set(itemB, similarity);
          if (!similarityMatrix.has(itemB)) {
            similarityMatrix.set(itemB, new Map<string, number>());
          }
          similarityMatrix.get(itemB).set(itemA, similarity);
        }
      }
    }

    return similarityMatrix;
  }

  private async generateRecommendationsFromItemSimilarity(
    userInteractions: UserInteraction[],
    itemSimilarityMatrix: Map<string, Map<string, number>>,
    limit: number,
  ): Promise<ItemRecommendation[]> {
    const recommendations = new Map<string, { score: number; basedOn: string[] }>();
    const userTrackIds = new Set(userInteractions.map(i => i.trackId));

    for (const interaction of userInteractions) {
      const similarItems = itemSimilarityMatrix.get(interaction.trackId);
      if (!similarItems) continue;

      const userRating = this.getInteractionWeight(interaction.interactionType);

      for (const [similarTrackId, similarity] of similarItems) {
        if (userTrackIds.has(similarTrackId)) continue;

        const score = similarity * userRating;

        if (recommendations.has(similarTrackId)) {
          const existing = recommendations.get(similarTrackId);
          existing.score += score;
          existing.basedOn.push(interaction.trackId);
        } else {
          recommendations.set(similarTrackId, {
            score,
            basedOn: [interaction.trackId],
          });
        }
      }
    }

    return Array.from(recommendations.entries())
      .map(([trackId, { score, basedOn }]) => ({
        trackId,
        score,
        explanation: {
          type: 'collaborative_filtering',
          method: 'item_based',
          basedOnTracks: basedOn.slice(0, 3),
          confidence: Math.min(score / 5, 1),
        },
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async getUserInteractions(userId: string): Promise<UserInteraction[]> {
    return this.userInteractionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  private getInteractionWeight(interactionType: InteractionType): number {
    const weights = {
      [InteractionType.LIKE]: 5,
      [InteractionType.ADD_TO_PLAYLIST]: 4,
      [InteractionType.DOWNLOAD]: 4,
      [InteractionType.SHARE]: 3,
      [InteractionType.PLAY]: 2,
      [InteractionType.SKIP]: -1,
      [InteractionType.DISLIKE]: -3,
    };

    return weights[interactionType] || 1;
  }
}