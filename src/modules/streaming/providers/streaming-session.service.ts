import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { StreamingSession } from '../../../database/entities/streaming-session.entity';
import { StreamingAnalytics } from '../../../database/entities/streaming-analytics.entity';
import { CreateStreamingSessionDto, UpdateStreamingSessionDto } from '../dto/create-streaming-session.dto';
import { AudioQuality, StreamingStatus } from '../enums/audio-quality.enum';

@Injectable()
export class StreamingSessionService {
  constructor(
    @InjectRepository(StreamingSession)
    private readonly streamingSessionRepository: Repository<StreamingSession>,
    @InjectRepository(StreamingAnalytics)
    private readonly analyticsRepository: Repository<StreamingAnalytics>,
  ) {}

  async createSession(
    userId: string,
    createSessionDto: CreateStreamingSessionDto,
    request: any
  ): Promise<StreamingSession> {
    const session = this.streamingSessionRepository.create({
      userId,
      trackId: createSessionDto.trackId,
      quality: createSessionDto.quality || AudioQuality.HIGH,
      ipAddress: createSessionDto.ipAddress || request.ip,
      userAgent: createSessionDto.userAgent || request.headers['user-agent'],
      location: createSessionDto.location,
      status: StreamingStatus.PLAYING,
    });

    const savedSession = await this.streamingSessionRepository.save(session);
    
    // Update analytics
    await this.updateAnalytics(userId, createSessionDto.trackId, 'play_started');
    
    return savedSession;
  }

  async updateSession(
    sessionId: string,
    updateSessionDto: UpdateStreamingSessionDto
  ): Promise<StreamingSession> {
    const session = await this.streamingSessionRepository.findOne({
      where: { id: sessionId }
    });

    if (!session) {
      throw new NotFoundException('Streaming session not found');
    }

    Object.assign(session, updateSessionDto);
    return this.streamingSessionRepository.save(session);
  }

  async endSession(sessionId: string, duration: number, bytesStreamed: number): Promise<void> {
    const session = await this.streamingSessionRepository.findOne({
      where: { id: sessionId }
    });

    if (!session) {
      throw new NotFoundException('Streaming session not found');
    }

    session.endTime = new Date();
    session.duration = duration;
    session.bytesStreamed = bytesStreamed;
    session.status = StreamingStatus.STOPPED;

    await this.streamingSessionRepository.save(session);

    // Update analytics with completion data
    await this.updateAnalytics(session.userId, session.trackId, 'play_completed', {
      duration,
      bytesStreamed,
      quality: session.quality
    });
  }

  async getUserActiveSessions(userId: string): Promise<StreamingSession[]> {
    return this.streamingSessionRepository.find({
      where: {
        userId,
        status: StreamingStatus.PLAYING
      },
      relations: ['track'],
      order: { startTime: 'DESC' }
    });
  }

  async getSessionAnalytics(userId: string, startDate: Date, endDate: Date) {
    const sessions = await this.streamingSessionRepository.find({
      where: {
        userId,
        startTime: Between(startDate, endDate)
      },
      relations: ['track']
    });

    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
    const totalBytes = sessions.reduce((sum, session) => sum + Number(session.bytesStreamed), 0);
    
    const qualityDistribution = sessions.reduce((acc, session) => {
      acc[session.quality] = (acc[session.quality] || 0) + 1;
      return acc;
    }, {} as Record<AudioQuality, number>);

    return {
      totalSessions,
      totalDuration,
      totalBytes,
      qualityDistribution,
      averageSessionDuration: totalSessions > 0 ? totalDuration / totalSessions : 0
    };
  }

  private async updateAnalytics(
    userId: string,
    trackId: string,
    event: string,
    metadata?: any
  ): Promise<void> {
    let analytics = await this.analyticsRepository.findOne({
      where: { userId, trackId }
    });

    if (!analytics) {
      analytics = this.analyticsRepository.create({
        userId,
        trackId,
        playCount: 0,
        totalDuration: 0,
        completionRate: 0,
        skipRate: 0,
        averageListenTime: 0
      });
    }

    switch (event) {
      case 'play_started':
        analytics.playCount += 1;
        analytics.lastPlayedAt = new Date();
        analytics.consecutivePlays += 1;
        break;
      
      case 'play_completed':
        if (metadata) {
          analytics.totalDuration += metadata.duration;
          analytics.averageListenTime = analytics.totalDuration / analytics.playCount;
          
          // Update completion rate (simplified calculation)
          const completionPercentage = (metadata.duration / 180) * 100; // assuming 3min average track
          analytics.completionRate = (analytics.completionRate + Math.min(completionPercentage, 100)) / 2;
        }
        break;
      
      case 'play_skipped':
        analytics.skipRate = ((analytics.skipRate * (analytics.playCount - 1)) + 100) / analytics.playCount;
        break;
    }

    await this.analyticsRepository.save(analytics);
  }

  async getBandwidthOptimization(userId: string, connectionSpeed: number): Promise<AudioQuality> {
    // Simple bandwidth optimization logic
    if (connectionSpeed < 500) { // < 500 kbps
      return AudioQuality.LOW;
    } else if (connectionSpeed < 2000) { // < 2 Mbps
      return AudioQuality.HIGH;
    } else {
      return AudioQuality.LOSSLESS;
    }
  }
}
