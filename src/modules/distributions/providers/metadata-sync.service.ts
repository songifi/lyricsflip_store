import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DistributionMetadata } from '../entities/distribution-metadata.entity';
import { DistributionRelease } from '../entities/distribution-release.entity';

@Injectable()
export class MetadataSyncService {
  private readonly logger = new Logger(MetadataSyncService.name);

  constructor(
    private readonly metadataRepository: Repository<DistributionMetadata>,
    private readonly releaseRepository: Repository<DistributionRelease>,
    @InjectRepository(DistributionMetadata)
  ) {}

  async syncMetadata(releaseId: string, platform: string): Promise<DistributionMetadata> {
    const release = await this.releaseRepository.findOne({
      where: { id: releaseId },
      relations: ['partner'],
    });

    if (!release) {
      throw new Error(`Release with ID ${releaseId} not found`);
    }

    // Get current metadata from the music module
    const currentMetadata = await this.getCurrentMetadata(releaseId);
    
    // Get platform-specific metadata requirements
    const platformMetadata = await this.getPlatformSpecificMetadata(
      currentMetadata,
      platform,
      release.partner.metadataRequirements,
    );

    let metadataEntry = await this.metadataRepository.findOne({
      where: { releaseId, platform },
    });

    if (!metadataEntry) {
      metadataEntry = this.metadataRepository.create({
        releaseId,
        platform,
        metadata: currentMetadata,
        platformSpecificMetadata: platformMetadata,
      });
    } else {
      metadataEntry.metadata = currentMetadata;
      metadataEntry.platformSpecificMetadata = platformMetadata;
      metadataEntry.syncRequired = false;
    }

    metadataEntry.lastSyncedAt = new Date();
    
    try {
      // Sync with external platform
      await this.syncWithPlatform(platform, platformMetadata, release.externalReleaseId);
      metadataEntry.syncErrors = null;
    } catch (error) {
      this.logger.error(`Failed to sync metadata for ${releaseId} on ${platform}:`, error);
      metadataEntry.syncErrors = error.message;
      metadataEntry.syncRequired = true;
    }

    return this.metadataRepository.save(metadataEntry);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async syncPendingMetadata(): Promise<void> {
    const pendingSync = await this.metadataRepository.find({
      where: { syncRequired: true },
    });

    for (const metadata of pendingSync) {
      try {
        await this.syncMetadata(metadata.releaseId, metadata.platform);
        this.logger.log(`Successfully synced metadata for release ${metadata.releaseId} on ${metadata.platform}`);
      } catch (error) {
        this.logger.error(`Failed to sync metadata for ${metadata.releaseId}:`, error);
      }
    }
  }

  private async getCurrentMetadata(releaseId: string): Promise<Record<string, any>> {
    // This would typically fetch from your music module
    // For now, returning a mock structure
    return {
      title: 'Track Title',
      artist: 'Artist Name',
      album: 'Album Name',
      genre: 'Pop',
      releaseDate: new Date().toISOString(),
      duration: 180,
      isrc: 'USRC17607839',
      upc: '123456789012',
      copyright: '2024 Artist Name',
      description: 'Track description',
      tags: ['pop', 'electronic'],
      language: 'en',
      explicit: false,
    };
  }

  private async getPlatformSpecificMetadata(
    baseMetadata: Record<string, any>,
    platform: string,
    requirements: Record<string, any>,
  ): Promise<Record<string, any>> {
    const platformMetadata = { ...baseMetadata };

    switch (platform) {
      case 'spotify':
        return this.formatForSpotify(platformMetadata, requirements);
      case 'apple_music':
        return this.formatForAppleMusic(platformMetadata, requirements);
      case 'youtube_music':
        return this.formatForYouTubeMusic(platformMetadata, requirements);
      default:
        return platformMetadata;
    }
  }

  private formatForSpotify(metadata: Record<string, any>, requirements: Record<string, any>): Record<string, any> {
    return {
      ...metadata,
      spotify_uri: metadata.spotify_uri || null,
      preview_url: metadata.preview_url || null,
      external_urls: metadata.external_urls || {},
    };
  }

  private formatForAppleMusic(metadata: Record<string, any>, requirements: Record<string, any>): Record<string, any> {
    return {
      ...metadata,
      apple_music_id: metadata.apple_music_id || null,
      storefront: metadata.storefront || 'us',
      artwork_url: metadata.artwork_url || null,
    };
  }

  private formatForYouTubeMusic(metadata: Record<string, any>, requirements: Record<string, any>): Record<string, any> {
    return {
      ...metadata,
      youtube_video_id: metadata.youtube_video_id || null,
      youtube_channel_id: metadata.youtube_channel_id || null,
      category: metadata.category || 'Music',
    };
  }

  private async syncWithPlatform(
    platform: string,
    metadata: Record<string, any>,
    externalReleaseId?: string,
  ): Promise<void> {
    // Implement platform-specific API calls
    switch (platform) {
      case 'spotify':
        await this.syncWithSpotify(metadata, externalReleaseId);
        break;
      case 'apple_music':
        await this.syncWithAppleMusic(metadata, externalReleaseId);
        break;
      default:
        this.logger.warn(`No sync handler for platform ${platform}`);
    }
  }

  private async syncWithSpotify(metadata: Record<string, any>, externalReleaseId?: string): Promise<void> {
    // Implement Spotify API sync
    this.logger.log('Syncing metadata with Spotify');
  }

  private async syncWithAppleMusic(metadata: Record<string, any>, externalReleaseId?: string): Promise<void> {
    // Implement Apple Music API sync
    this.logger.log('Syncing metadata with Apple Music');
  }

  async markForSync(releaseId: string, platform?: string): Promise<void> {
    const whereCondition: any = { releaseId };
    if (platform) {
      whereCondition.platform = platform;
    }

    await this.metadataRepository.update(whereCondition, {
      syncRequired: true,
    });
  }

  async getMetadataStatus(releaseId: string): Promise<DistributionMetadata[]> {
    return this.metadataRepository.find({
      where: { releaseId },
      order: { lastSyncedAt: 'DESC' },
    });
  }
}
