import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserInteraction, InteractionType } from '../entities/user-interaction.entity';
import { Recommendation } from '../entities/recommendation.entity';
import { RecommendationsService } from './recommendations.service';

interface RealtimeUpdateEvent {
  userId: string;
  trackId: string;
  interactionType: InteractionType;
  timestamp: Date;
  context?: Record<string, any>;
}

@Injectable()
export class RealtimeUpdateService {
  private readonly logger = new Logger(RealtimeUpdateService.name);

  constructor(
    @InjectRepository(UserInteraction)
    private userInteractionRepository: Repository<UserInteraction>,
    @InjectRepository(Recommendation)
    private recommendationRepository: Repository<Recommendation>,
    @InjectQueue('recommendation-updates')
    private updateQueue: Queue,
    private eventEmitter: EventEmitter2,
    private recommendationsService: RecommendationsService,
  ) {}

  async processUserInteraction(event: RealtimeUpdateEvent): Promise<void> {
    try {
      // Store the interaction
      await this.storeInteraction(event);

      // Trigger immediate recommendation updates for high-impact interactions
      if (this.isHighImpactInteraction(event.interactionType)) {
        await this.triggerImmediateUpdate(event.userId);
      }

      // Queue background updates
      await this.queueBackgroundUpdates(event);

      // Emit event for other services
      this.eventEmitter.emit('user.interaction', event);

      this.logger.log(`Processed interaction: ${event.interactionType} for user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Error processing user interaction: ${error.message}`);
      throw error;
    }
  }

  async updateUserRecommendations(userId: string, immediate: boolean = false): Promise<void> {
    try {
      if (immediate) {
        await this.performImmediateUpdate(userId);
      } else {
        await this.updateQueue.add('update-user-recommendations', { userId }, {
          delay: 5000, // 5 second delay for batching
          attempts: 3,
        });
      }
    } catch (error) {
      this.logger.error(`Error updating user recommendations: ${error.message}`);
      throw error;
    }
  }

  async invalidateStaleRecommendations(userId: string): Promise<void> {
    try {
      const staleThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours

      await this.recommendationRepository
        .createQueryBuilder()
        .update(Recommendation)
        .set({ isActive: false })
        .where('userId = :userId', { userId })
        .andWhere('createdAt < :staleThreshold', { staleThreshold })
        .andWhere('isActive = :isActive', { isActive: true })
        .execute();

      this.logger.log(`Invalidated stale recommendations for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error invalidating stale recommendations: ${error.message}`);
      throw error;
    }
  }

  async batchUpdateRecommendations(userIds: string[]): Promise<void> {
    try {
      const batchSize = 10;
      
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(userId => this.updateQueue.add('update-user-recommendations', { userId }, {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          }))
        );

        // Small delay between batches to prevent overwhelming the system
        if (i + batchSize < userIds.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      this.logger.log(`Queued recommendation updates for ${userIds.length} users`);
    } catch (error) {
      this.logger.error(`Error batch updating recommendations: ${error.message}`);
      throw error;
    }
  }

  async handleTrendingUpdate(trackId: string): Promise<void> {
    try {
      // Get users who might be interested in this trending track
      const interestedUsers = await this.findUsersInterestedInTrack(trackId);
      
      // Add trending recommendations
      await this.addTrendingRecommendations(trackId, interestedUsers);

      this.logger.log(`Added trending recommendations for track ${trackId} to ${interestedUsers.length} users`);
    } catch (error) {
      this.logger.error(`Error handling trending update: ${error.message}`);
      throw error;
    }
  }

  private async storeInteraction(event: RealtimeUpdateEvent): Promise<UserInteraction> {
    const interaction = this.userInteractionRepository.create({
      userId: event.userId,
      trackId: event.trackId,
      interactionType: event.interactionType,
      context: event.context,
      createdAt: event.timestamp,
    });

    return this.userInteractionRepository.save(interaction);
  }

  private isHighImpactInteraction(interactionType: InteractionType): boolean {
    const highImpactTypes = [
      InteractionType.LIKE,
      InteractionType.DISLIKE,
      InteractionType.ADD_TO_PLAYLIST,
      InteractionType.DOWNLOAD,
    ];

    return highImpactTypes.includes(interactionType);
  }

  private async triggerImmediateUpdate(userId: string): Promise<void> {
    // Invalidate current recommendations
    await this.invalidateStaleRecommendations(userId);
    
    // Generate new recommendations immediately
    await this.performImmediateUpdate(userId);
  }

  private async performImmediateUpdate(userId: string): Promise<void> {
    try {
      // Generate fresh recommendations
      const recommendations = await this.recommendationsService.generateRecommendations(userId, 20);
      
      // Store new recommendations
      await this.storeRecommendations(userId, recommendations);

      this.logger.log(`Generated ${recommendations.length} immediate recommendations for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error performing immediate update: ${error.message}`);
      throw error;
    }
  }

  private async queueBackgroundUpdates(event: RealtimeUpdateEvent): Promise<void> {
    // Queue user profile update
    await this.updateQueue.add('update-user-profile', {
      userId: event.userId,
      interaction: event,
    }, {
      delay: 10000, // 10 second delay
      attempts: 2,
    });

    // Queue similar users update
    await this.updateQueue.add('update-similar-users', {
      userId: event.userId,
      trackId: event.trackId,
    }, {
      delay: 30000, // 30 second delay
      attempts: 2,
    });

    // Queue item similarity update
    await this.updateQueue.add('update-item-similarity', {
      trackId: event.trackId,
      userId: event.userId,
    }, {
      delay: 60000, // 1 minute delay
      attempts: 2,
    });
  }

  private async findUsersInterestedInTrack(trackId: string): Promise<string[]> {
    // Find users who have interacted with similar tracks
    const similarInteractions = await this.userInteractionRepository
      .createQueryBuilder('interaction')
      .select('DISTINCT interaction.userId')
      .innerJoin('interaction.track', 'track')
      .innerJoin('track.genre', 'genre')
      .innerJoin('track.artist', 'artist')
      .where(`track.id != :trackId`, { trackId })
      .andWhere(`(
        genre.id IN (
          SELECT g.id FROM tracks t 
          INNER JOIN genres g ON t.genreId = g.id 
          WHERE t.id = :trackId
        ) OR
        artist.id IN (
          SELECT a.id FROM tracks t 
          INNER JOIN artists a ON t.artistId = a.id 
          WHERE t.id = :trackId
        )
      )`)
      .setParameter('trackId', trackId)
      .getRawMany();

    return similarInteractions.map(i => i.interaction_userId);
  }

  private async addTrendingRecommendations(trackId: string, userIds: string[]): Promise<void> {
    const recommendations = userIds.map(userId => ({
      userId,
      trackId,
      recommendationType: 'trending',
      score: 0.8,
      confidence: 0.9,
      explanation: {
        type: 'trending',
        reason: 'This track is trending among users with similar taste',
        trendingScore: 0.8,
      },
      isActive: true,
    }));

    await this.recommendationRepository
      .createQueryBuilder()
      .insert()
      .into(Recommendation)
      .values(recommendations)
      .orIgnore() // Avoid duplicates
      .execute();
  }

  private async storeRecommendations(userId: string, recommendations: any[]): Promise<void> {
    const recommendationEntities = recommendations.map(rec => ({
      userId,
      trackId: rec.trackId,
      recommendationType: rec.type || 'hybrid',
      score: rec.score,
      confidence: rec.confidence,
      explanation: rec.explanation,
      metadata: rec.metadata,
      isActive: true,
    }));

    await this.recommendationRepository.save(recommendationEntities);
  }
}