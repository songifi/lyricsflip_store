import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rights } from './entities/rights.entity';
import { CopyrightRegistration } from './entities/copyright-registration.entity';
import { RightsTransfer } from './entities/rights-transfer.entity';
import { RightsConflict } from './entities/rights-conflict.entity';
import { CollectionSocietyReport } from './entities/collection-society-report.entity';
import { RightsService } from './services/rights.service';
import { CopyrightRegistrationService } from './services/copyright-registration.service';
import { RightsTransferService } from './services/rights-transfer.service';
import { RightsConflictService } from './services/rights-conflict.service';
import { CollectionSocietyReportService } from './services/collection-society-report.service';
import { RightsController } from './controllers/rights.controller';
import { CopyrightRegistrationController } from './controllers/copyright-registration.controller';
import { RightsTransferController } from './controllers/rights-transfer.controller';
import { RightsConflictController } from './controllers/rights-conflict.controller';
import { CollectionSocietyReportController } from './controllers/collection-society-report.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Rights,
      CopyrightRegistration,
      RightsTransfer,
      RightsConflict,
      CollectionSocietyReport,
    ]),
  ],
  controllers: [
    RightsController,
    CopyrightRegistrationController,
    RightsTransferController,
    RightsConflictController,
    CollectionSocietyReportController,
  ],
  providers: [
    RightsService,
    CopyrightRegistrationService,
    RightsTransferService,
    RightsConflictService,
    CollectionSocietyReportService,
  ],
  exports: [
    RightsService,
    CopyrightRegistrationService,
    RightsTransferService,
    RightsConflictService,
    CollectionSocietyReportService,
  ],
})
export class RightsModule {}