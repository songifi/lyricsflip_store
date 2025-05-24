import { Injectable } from '@nestjs/common';
import { CrossfadeSettingsDto, GaplessPlaybackDto, PlaybackSettingsDto } from '../dto/playback-settings.dto';

@Injectable()
export class PlaybackService {
  private userSettings = new Map<string, PlaybackSettingsDto>();

  async updatePlaybackSettings(userId: string, settings: PlaybackSettingsDto): Promise<PlaybackSettingsDto> {
    this.userSettings.set(userId, settings);
    return settings;
  }

  async getPlaybackSettings(userId: string): Promise<PlaybackSettingsDto> {
    return this.userSettings.get(userId) || this.getDefaultSettings();
  }

  async getCrossfadeSettings(userId: string): Promise<CrossfadeSettingsDto> {
    const settings = await this.getPlaybackSettings(userId);
    return settings.crossfade || this.getDefaultCrossfadeSettings();
  }

  async getGaplessSettings(userId: string): Promise<GaplessPlaybackDto> {
    const settings = await this.getPlaybackSettings(userId);
    return settings.gapless || this.getDefaultGaplessSettings();
  }

  async calculateCrossfadePoints(
    currentTrackDuration: number,
    nextTrackDuration: number,
    crossfadeSettings: CrossfadeSettingsDto
  ): Promise<{ fadeOutStart: number; fadeInEnd: number }> {
    if (!crossfadeSettings.enabled) {
      return {
        fadeOutStart: currentTrackDuration,
        fadeInEnd: 0
      };
    }

    const fadeOutStart = Math.max(0, currentTrackDuration - crossfadeSettings.duration);
    const fadeInEnd = Math.min(nextTrackDuration, crossfadeSettings.duration);

    return { fadeOutStart, fadeInEnd };
  }

  async generateCrossfadeCurve(
    duration: number,
    curve: 'linear' | 'exponential' | 'logarithmic',
    sampleRate: number = 44100
  ): Promise<number[]> {
    const samples = Math.floor(duration * sampleRate);
    const fadePoints: number[] = [];

    for (let i = 0; i < samples; i++) {
      const progress = i / samples;
      let volume: number;

      switch (curve) {
        case 'exponential':
          volume = Math.pow(progress, 2);
          break;
        case 'logarithmic':
          volume = Math.log10(progress * 9 + 1);
          break;
        case 'linear':
        default:
          volume = progress;
          break;
      }

      fadePoints.push(volume);
    }

    return fadePoints;
  }

  async getPreloadBuffer(
    userId: string,
    trackDuration: number
  ): Promise<{ preloadTime: number; bufferSize: number }> {
    const gaplessSettings = await this.getGaplessSettings(userId);
    
    if (!gaplessSettings.enabled || !gaplessSettings.preloadNext) {
      return { preloadTime: 0, bufferSize: 0 };
    }

    // Preload the last 10 seconds or 10% of track, whichever is smaller
    const preloadTime = Math.min(10, trackDuration * 0.1);
    const bufferSize = gaplessSettings.bufferSize * 1024 * 1024; // Convert MB to bytes

    return { preloadTime, bufferSize };
  }

  async optimizeBufferSize(
    connectionSpeed: number, // in kbps
    quality: string
  ): Promise<number> {
    // Base buffer sizes in MB
    const baseBufferSizes = {
      '128k': 2,
      '320k': 4,
      'lossless': 8
    };

    const baseSize = baseBufferSizes[quality] || 4;

    // Adjust based on connection speed
    if (connectionSpeed < 500) {
      return Math.max(1, baseSize * 0.5); // Reduce buffer for slow connections
    } else if (connectionSpeed > 5000) {
      return baseSize * 2; // Increase buffer for fast connections
    }

    return baseSize;
  }

  private getDefaultSettings(): PlaybackSettingsDto {
    return {
      crossfade: this.getDefaultCrossfadeSettings(),
      gapless: this.getDefaultGaplessSettings(),
      adaptiveQuality: true
    };
  }

  private getDefaultCrossfadeSettings(): CrossfadeSettingsDto {
    return {
      enabled: false,
      duration: 3,
      curve: 'linear'
    };
  }

  private getDefaultGaplessSettings(): GaplessPlaybackDto {
    return {
      enabled: true,
      preloadNext: true,
      bufferSize: 4 // MB
    };
  }
}
