import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

// Entities
import { Sample } from './entities/sample.entity';
import { SampleLicense } from './entities/sample-license.entity';
import { SamplePack } from './entities/sample-pack.entity';
import { SampleTag } from './entities/sample-tag.entity';
import { SampleUsage } from './entities/sample-usage.entity';
import { SampleRoyalty } from './entities/sample-royalty.entity';

// Services
import { SamplesService } from './services/samples.service';
import { SamplePacksService } from './services/sample-packs.service';
import { SampleLicensesService } from './services/sample-licenses.service';
import { SampleRoyaltiesService } from './services/sample-royalties.service';

// Controllers
import { SamplesController } from './controllers/samples.controller';
import { SamplePacksController } from './controllers/sample-packs.controller';
import { SampleLicensesController } from './controllers/sample-licenses.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sample,
      SampleLicense,
      SamplePack,
      SampleTag,
      SampleUsage,
      SampleRoyalty,
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    SamplesController,
    SamplePacksController,
    SampleLicensesController,
  ],
  providers: [
    SamplesService,
    SamplePacksService,
    SampleLicensesService,
    SampleRoyaltiesService,
  ],
  exports: [
    SamplesService,
    SamplePacksService,
    SampleLicensesService,
    SampleRoyaltiesService,
  ],
})
export class SamplesModule {}