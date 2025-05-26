import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { WellnessController } from "./wellness.controller"
import { WellnessService } from "./wellness.service"
import { MoodRecommendationController } from "./mood-recommendation/mood-recommendation.controller"
import { MoodRecommendationService } from "./mood-recommendation/mood-recommendation.service"
import { MeditationController } from "./meditation/meditation.controller"
import { MeditationService } from "./meditation/meditation.service"
import { TherapistController } from "./therapist/therapist.controller"
import { TherapistService } from "./therapist/therapist.service"
import { WellnessAnalyticsController } from "./analytics/wellness-analytics.controller"
import { WellnessAnalyticsService } from "./analytics/wellness-analytics.service"
import { FrequencyTherapyController } from "./frequency-therapy/frequency-therapy.controller"
import { FrequencyTherapyService } from "./frequency-therapy/frequency-therapy.service"

// Entities
import { WellnessCategory } from "../../database/entities/wellness-category.entity"
import { WellnessProgram } from "../../database/entities/wellness-program.entity"
import { UserWellnessProgress } from "../../database/entities/user-wellness-progress.entity"
import { MoodEntry } from "../../database/entities/mood-entry.entity"
import { MeditationSession } from "../../database/entities/meditation-session.entity"
import { TherapistProfile } from "../../database/entities/therapist-profile.entity"
import { FrequencyTherapy } from "../../database/entities/frequency-therapy.entity"
import { WellnessOutcome } from "../../database/entities/wellness-outcome.entity"
import { TherapeuticTrack } from "../../database/entities/therapeutic-track.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WellnessCategory,
      WellnessProgram,
      UserWellnessProgress,
      MoodEntry,
      MeditationSession,
      TherapistProfile,
      FrequencyTherapy,
      WellnessOutcome,
      TherapeuticTrack,
    ]),
  ],
  controllers: [
    WellnessController,
    MoodRecommendationController,
    MeditationController,
    TherapistController,
    WellnessAnalyticsController,
    FrequencyTherapyController,
  ],
  providers: [
    WellnessService,
    MoodRecommendationService,
    MeditationService,
    TherapistService,
    WellnessAnalyticsService,
    FrequencyTherapyService,
  ],
  exports: [
    WellnessService,
    MoodRecommendationService,
    MeditationService,
    TherapistService,
    WellnessAnalyticsService,
    FrequencyTherapyService,
  ],
})
export class WellnessModule {}
