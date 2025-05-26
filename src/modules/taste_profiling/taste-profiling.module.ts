import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  TasteProfile,
  BehaviorLog,
  TasteEvolution
} from './entities';
import {
  TasteProfileService,
  BehaviorService,
  EvolutionService,
  SimilarityService,
  ContextService,
  AnalyticsService
} from './services';
import {
  TasteProfileController,
  BehaviorController,
  EvolutionController,
  SimilarityController,
  ContextController,
  AnalyticsController
} from './controllers';

@Module({
  imports: [TypeOrmModule.forFeature([TasteProfile, BehaviorLog, TasteEvolution])],
  controllers: [
    TasteProfileController,
    BehaviorController,
    EvolutionController,
    SimilarityController,
    ContextController,
    AnalyticsController
  ],
  providers: [
    TasteProfileService,
    BehaviorService,
    EvolutionService,
    SimilarityService,
    ContextService,
    AnalyticsService
  ],
})
export class TasteProfilingModule {}
