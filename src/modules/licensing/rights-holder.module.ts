import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RightsHolder } from '../entities/rights-holder.entity';
import { RightsHolderService } from '../services/rights-holder.service';
import { RightsHolderController } from '../controllers/rights-holder.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RightsHolder])],
  providers: [RightsHolderService],
  controllers: [RightsHolderController],
  exports: [RightsHolderService],
})
export class RightsHolderModule {}
