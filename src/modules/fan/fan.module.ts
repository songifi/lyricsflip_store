// src/modules/user-system.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';

// Entities
import { User } from '../entities/user.entity';
import { UserProfile } from '../entities/user-profile.entity';
import { MusicPreference } from '../entities/music-preference.entity';
import { UserFollowing } from '../entities/user-following.entity';
import { ArtistFollowing } from '../entities/artist-following.entity';
import { UserLibrary } from '../entities/user-library.entity';
import { LibraryItem } from '../entities/library-item.entity';
import { Playlist } from '../entities/playlist.entity';
import { PlaylistTrack } from '../entities/playlist-track.entity';
import { ListeningSession } from '../entities/listening-session.entity';
import { ListeningStats } from '../entities/listening-stats.entity';
import { YearEndWrap } from '../entities/year-end-wrap.entity';
import { UserActivity } from '../entities/user-activity.entity';
import { ActivityFeed } from '../entities/activity-feed.entity';
import { UserSubscription } from '../entities/user-subscription.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { SocialPost } from '../entities/social-post.entity';
import { PostLike } from '../entities/post-like.entity';
import { PostComment } from '../entities/post-comment.entity';
import { UserNotification } from '../entities/user-notification.entity';
import { FriendRequest } from '../entities/friend-request.entity';

// Controllers
import { UserController } from '../controllers/user.controller';
import { UserProfileController } from '../controllers/user-profile.controller';
import { MusicPreferenceController } from '../controllers/music-preference.controller';
import { FollowingController } from '../controllers/following.controller';
import { UserLibraryController } from '../controllers/user-library.controller';
import { PlaylistController } from '../controllers/playlist.controller';
import { ListeningSessionController } from '../controllers/listening-session.controller';
import { ListeningStatsController } from '../controllers/listening-stats.controller';
import { YearEndWrapController } from '../controllers/year-end-wrap.controller';
import { ActivityFeedController } from '../controllers/activity-feed.controller';
import { SocialController } from '../controllers/social.controller';
import { SubscriptionController } from '../controllers/subscription.controller';
import { NotificationController } from '../controllers/notification.controller';

// Services
import { UserService } from '../services/user.service';
import { UserProfileService } from '../services/user-profile.service';
import { MusicPreferenceService } from '../services/music-preference.service';
import { FollowingService } from '../services/following.service';
import { UserLibraryService } from '../services/user-library.service';
import { PlaylistService } from '../services/playlist.service';
import { ListeningSessionService } from '../services/listening-session.service';
import { ListeningStatsService } from '../services/listening-stats.service';
import { YearEndWrapService } from '../services/year-end-wrap.service';
import { ActivityFeedService } from '../services/activity-feed.service';
import { SocialService } from '../services/social.service';
import { SubscriptionService } from '../services/subscription.service';
import { NotificationService } from '../services/notification.service';
import { RecommendationService } from '../services/recommendation.service';
import { AnalyticsService } from '../services/analytics.service';

// Guards and Strategies
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../guards/optional-jwt-auth.guard';
import { PremiumGuard } from '../guards/premium.guard';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { LocalStrategy } from '../strategies/local.strategy';

// Processors (for background jobs)
import { StatsProcessor } from '../processors/stats.processor';
import { NotificationProcessor } from '../processors/notification.processor';
import { YearEndWrapProcessor } from '../processors/year-end-wrap.processor';
import { RecommendationProcessor } from '../processors/recommendation.processor';

// Middleware
import { ActivityTrackingMiddleware } from '../middleware/activity-tracking.middleware';
import { UserContextMiddleware } from '../middleware/user-context.middleware';

// Interceptors
import { UserActivityInterceptor } from '../interceptors/user-activity.interceptor';
import { CacheInterceptor } from '../interceptors/cache.interceptor';

// Validators
import { UniqueEmailValidator } from '../validators/unique-email.validator';
import { UniqueUsernameValidator } from '../validators/unique-username.validator';

// Event Listeners
import { UserEventListener } from '../listeners/user-event.listener';
import { ListeningEventListener } from '../listeners/listening-event.listener';
import { SocialEventListener } from '../listeners/social-event.listener';

@Module({
  imports: [
    // Core modules
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // JWT Configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: any) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: ['ConfigService'],
    }),

    // Cache Configuration
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: any) => ({
        ttl: configService.get('CACHE_TTL', 300),
        max: configService.get('CACHE_MAX_ITEMS', 1000),
      }),
      inject: ['ConfigService'],
    }),

    // Background Job Queues
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: any) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: ['ConfigService'],
    }),

    // Queue Registration
    BullModule.registerQueue(
      { name: 'stats-processing' },
      { name: 'notifications' },
      { name: 'year-end-wrap' },
      { name: 'recommendations' },
      { name: 'analytics' },
    ),

    // TypeORM Entity Registration
    TypeOrmModule.forFeature([
      // Core User Entities
      User,
      UserProfile,
      MusicPreference,
      
      // Following System Entities
      UserFollowing,
      ArtistFollowing,
      FriendRequest,
      
      // Library and Collection Entities
      UserLibrary,
      LibraryItem,
      Playlist,
      PlaylistTrack,
      
      // Listening and Analytics Entities
      ListeningSession,
      ListeningStats,
      YearEndWrap,
      
      // Social Features Entities
      UserActivity,
      ActivityFeed,
      SocialPost,
      PostLike,
      PostComment,
      UserNotification,
      
      // Subscription Entities
      UserSubscription,
      SubscriptionPlan,
    ]),
  ],

  controllers: [
    // Core Controllers
    UserController,
    UserProfileController,
    MusicPreferenceController,
    
    // Following System Controllers
    FollowingController,
    
    // Library and Collection Controllers
    UserLibraryController,
    PlaylistController,
    
    // Listening and Analytics Controllers
    ListeningSessionController,
    ListeningStatsController,
    YearEndWrapController,
    
    // Social Features Controllers
    ActivityFeedController,
    SocialController,
    NotificationController,
    
    // Subscription Controllers
    SubscriptionController,
  ],

  providers: [
    // Core Services
    UserService,
    UserProfileService,
    MusicPreferenceService,
    
    // Following System Services
    FollowingService,
    
    // Library and Collection Services
    UserLibraryService,
    PlaylistService,
    
    // Listening and Analytics Services
    ListeningSessionService,
    ListeningStatsService,
    YearEndWrapService,
    AnalyticsService,
    
    // Social Features Services
    ActivityFeedService,
    SocialService,
    NotificationService,
    
    // Subscription Services
    SubscriptionService,
    
    // Recommendation Service
    RecommendationService,
    
    // Authentication Strategies
    JwtStrategy,
    LocalStrategy,
    
    // Guards
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    PremiumGuard,
    
    // Background Job Processors
    StatsProcessor,
    NotificationProcessor,
    YearEndWrapProcessor,
    RecommendationProcessor,
    
    // Validators
    UniqueEmailValidator,
    UniqueUsernameValidator,
    
    // Event Listeners
    UserEventListener,
    ListeningEventListener,
    SocialEventListener,
    
    // Interceptors
    UserActivityInterceptor,
    CacheInterceptor,
    
    // Middleware (registered as providers for DI)
    ActivityTrackingMiddleware,
    UserContextMiddleware,
  ],

  exports: [
    // Export core services for use in other modules
    UserService,
    UserProfileService,
    MusicPreferenceService,
    FollowingService,
    UserLibraryService,
    PlaylistService,
    ListeningSessionService,
    ListeningStatsService,
    YearEndWrapService,
    ActivityFeedService,
    SocialService,
    NotificationService,
    SubscriptionService,
    RecommendationService,
    AnalyticsService,
    
    // Export authentication components
    JwtAuthGuard,
    OptionalJwtAuthGuard,
    PremiumGuard,
    JwtStrategy,
    
    // Export TypeORM repositories for other modules
    TypeOrmModule,
    
    // Export JWT module for other modules
    JwtModule,
    
    // Export cache module
    CacheModule,
  ],
})
export class UserSystemModule {
  constructor() {
    // Module initialization logic can go here
    console.log('UserSystemModule initialized');
  }

  // Optional: Configure middleware globally
  configure(consumer: any) {
    consumer
      .apply(UserContextMiddleware)
      .forRoutes('*');
      
    consumer
      .apply(ActivityTrackingMiddleware)
      .exclude(
        { path: '/health', method: 'GET' },
        { path: '/metrics', method: 'GET' },
      )
      .forRoutes('*');
  }
}

// Feature Module Exports for easier imports
export * from '../entities/user.entity';
export * from '../entities/user-profile.entity';
export * from '../entities/music-preference.entity';
export * from '../entities/user-following.entity';
export * from '../entities/artist-following.entity';
export * from '../entities/user-library.entity';
export * from '../entities/library-item.entity';
export * from '../entities/playlist.entity';
export * from '../entities/playlist-track.entity';
export * from '../entities/listening-session.entity';
export * from '../entities/listening-stats.entity';
export * from '../entities/year-end-wrap.entity';
export * from '../entities/user-activity.entity';
export * from '../entities/activity-feed.entity';
export * from '../entities/user-subscription.entity';
export * from '../entities/subscription-plan.entity';
export * from '../entities/social-post.entity';
export * from '../entities/post-like.entity';
export * from '../entities/post-comment.entity';
export * from '../entities/user-notification.entity';
export * from '../entities/friend-request.entity';

export * from '../services/user.service';
export * from '../services/user-profile.service';
export * from '../services/music-preference.service';
export * from '../services/following.service';
export * from '../services/user-library.service';
export * from '../services/playlist.service';
export * from '../services/listening-session.service';
export * from '../services/listening-stats.service';
export * from '../services/year-end-wrap.service';
export * from '../services/activity-feed.service';
export * from '../services/social.service';
export * from '../services/notification.service';
export * from '../services/subscription.service';
export * from '../services/recommendation.service';
export * from '../services/analytics.service';

export * from '../controllers/user.controller';
export * from '../controllers/user-profile.controller';
export * from '../controllers/music-preference.controller';
export * from '../controllers/following.controller';
export * from '../controllers/user-library.controller';
export * from '../controllers/playlist.controller';
export * from '../controllers/listening-session.controller';
export * from '../controllers/listening-stats.controller';
export * from '../controllers/year-end-wrap.controller';
export * from '../controllers/activity-feed.controller';
export * from '../controllers/social.controller';
export * from '../controllers/subscription.controller';
export * from '../controllers/notification.controller';

export * from '../guards/jwt-auth.guard';
export * from '../guards/optional-jwt-auth.guard';
export * from '../guards/premium.guard';

export * from '../dto/user.dto';
export * from '../dto/user-profile.dto';
export * from '../dto/music-preference.dto';
export * from '../dto/following.dto';
export * from '../dto/user-library.dto';
export * from '../dto/playlist.dto';
export * from '../dto/listening-session.dto';
export * from '../dto/listening-stats.dto';
export * from '../dto/year-end-wrap.dto';
export * from '../dto/activity-feed.dto';
export * from '../dto/social.dto';
export * from '../dto/subscription.dto';
export * from '../dto/notification.dto';