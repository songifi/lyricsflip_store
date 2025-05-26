import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArchiveService } from './services/archive.service';
import { ArchiveContributionService } from './services/archive-contribution.service';
import { ArchiveMilestoneService } from './services/archive-milestone.service';
import { ArchiveController } from './controllers/archive.controller';
import { Archive } from './entities/archive.entity';
import { ArchiveContribution } from './entities/archive-contribution.entity';
import { ArchiveMilestone } from './entities/archive-milestone.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Archive,
      ArchiveContribution,
      ArchiveMilestone,
    ]),
  ],
  controllers: [ArchiveController],
  providers: [
    ArchiveService,
    ArchiveContributionService,
    ArchiveMilestoneService,
  ],
  exports: [
    ArchiveService,
    ArchiveContributionService,
    ArchiveMilestoneService,
  ],
})
export class ArchiveModule {}