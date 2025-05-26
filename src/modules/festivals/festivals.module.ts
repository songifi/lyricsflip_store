import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { FestivalsController } from "./festivals.controller"
import { FestivalsService } from "./festivals.service"
import { StagesService } from "./stages.service"
import { ScheduleService } from "./schedule.service"
import { VendorsService } from "./vendors.service"
import { SponsorsService } from "./sponsors.service"
import { FestivalMapService } from "./festival-map.service"
import { AttendeeExperienceService } from "./attendee-experience.service"
import { FestivalAnalyticsService } from "./festival-analytics.service"
import { Festival } from "../../database/entities/festival.entity"
import { Stage } from "../../database/entities/stage.entity"
import { Performance } from "../../database/entities/performance.entity"
import { Vendor } from "../../database/entities/vendor.entity"
import { Sponsor } from "../../database/entities/sponsor.entity"
import { FestivalLocation } from "../../database/entities/festival-location.entity"
import { FestivalAttendee } from "../../database/entities/festival-attendee.entity"
import { FestivalAnalytics } from "../../database/entities/festival-analytics.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Festival,
      Stage,
      Performance,
      Vendor,
      Sponsor,
      FestivalLocation,
      FestivalAttendee,
      FestivalAnalytics,
    ]),
  ],
  controllers: [FestivalsController],
  providers: [
    FestivalsService,
    StagesService,
    ScheduleService,
    VendorsService,
    SponsorsService,
    FestivalMapService,
    AttendeeExperienceService,
    FestivalAnalyticsService,
  ],
  exports: [FestivalsService],
})
export class FestivalsModule {}
