import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PodcastsController } from "./controllers/podcasts.controller"
import { EpisodesController } from "./controllers/episodes.controller"
import { SubscriptionsController } from "./controllers/subscriptions.controller"
import { RssController } from "./controllers/rss.controller"
import { ChaptersController } from "./controllers/chapters.controller"
import { PodcastsService } from "./services/podcasts.service"
import { EpisodesService } from "./services/episodes.service"
import { SubscriptionsService } from "./services/subscriptions.service"
import { RssService } from "./services/rss.service"
import { ChaptersService } from "./services/chapters.service"
import { PodcastAnalyticsService } from "./services/podcast-analytics.service"
import { MonetizationService } from "./services/monetization.service"
import { Podcast } from "../../database/entities/podcast.entity"
import { Episode } from "../../database/entities/episode.entity"
import { PodcastSeries } from "../../database/entities/podcast-series.entity"
import { Season } from "../../database/entities/season.entity"
import { Chapter } from "../../database/entities/chapter.entity"
import { PodcastSubscription } from "../../database/entities/podcast-subscription.entity"
import { PodcastAnalytics } from "../../database/entities/podcast-analytics.entity"
import { MonetizationPlan } from "../../database/entities/monetization-plan.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Podcast,
      Episode,
      PodcastSeries,
      Season,
      Chapter,
      PodcastSubscription,
      PodcastAnalytics,
      MonetizationPlan,
    ]),
  ],
  controllers: [PodcastsController, EpisodesController, SubscriptionsController, RssController, ChaptersController],
  providers: [
    PodcastsService,
    EpisodesService,
    SubscriptionsService,
    RssService,
    ChaptersService,
    PodcastAnalyticsService,
    MonetizationService,
  ],
  exports: [PodcastsService, EpisodesService, SubscriptionsService, RssService, PodcastAnalyticsService],
})
export class PodcastsModule {}
