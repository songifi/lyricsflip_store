import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusicNFT } from './entities/nft.entity';
import { MusicNFTService } from './music-nft.service';
import { MusicNFTController } from './music-nft.controller';
import { IPFSService } from './decentralized-storage/ipfs.service';
import { MusicNFTContract } from './smart-contracts/music-nft.contract';
import { MarketplaceService } from './marketplace/marketplace.service';
import { AnalyticsService } from './analytics/analytics.service';

@Module({
  imports: [TypeOrmModule.forFeature([MusicNFT])],
  controllers: [MusicNFTController],
  providers: [
    MusicNFTService,
    IPFSService,
    MusicNFTContract,
    MarketplaceService,
    AnalyticsService,
  ],
})
export class MusicNFTModule {}