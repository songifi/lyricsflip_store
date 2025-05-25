import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchAnalyticsService } from './analytics/search-analytics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchEvent } from './entities/search-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SearchEvent])],
  controllers: [SearchController],
  providers: [
    SearchService,
    SearchAnalyticsService,
  ],
})
export class SearchModule {}
