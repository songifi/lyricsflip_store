import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MusicNFT } from './entities/nft.entity';
import { CreateNFTDto } from './dto/create-nft.dto';
import { IPFSService } from './decentralized-storage/ipfs.service';
import { MusicNFTContract } from './smart-contracts/music-nft.contract';
import { MarketplaceService } from './marketplace/marketplace.service';
import { AnalyticsService } from './analytics/analytics.service';

@Injectable()
export class MusicNFTService {
  constructor(
    @InjectRepository(MusicNFT)
    private readonly nftRepo: Repository<MusicNFT>,
    private readonly ipfs: IPFSService,
    private readonly contract: MusicNFTContract,
    private readonly marketplace: MarketplaceService,
    private readonly analytics: AnalyticsService,
  ) {}

  async createNFT(dto: CreateNFTDto) {
    const metadata = {
      title: dto.title,
      description: dto.description,
      artist: dto.artist,
      image: dto.coverImageUrl,
      audio: dto.audioUrl,
    };

    const metadataUrl = await this.ipfs.uploadMetadata(metadata);
    const tokenId = await this.contract.mintNFT(dto.ownerWalletAddress, metadataUrl, dto.royaltyPercentage);

    const nft = this.nftRepo.create({ ...dto, metadataIpfsUrl: metadataUrl });
    await this.nftRepo.save(nft);

    this.analytics.logEvent('NFT_CREATED', { tokenId });
    return nft;
  }

  async verifyOwnership(tokenId: string, wallet: string) {
    return await this.contract.verifyOwnership(tokenId, wallet);
  }

  async listNFT(tokenId: string, price: number, sellerWallet: string) {
    return this.marketplace.listNFT(tokenId, price, sellerWallet);
  }

  async buyNFT(tokenId: string, buyerWallet: string) {
    return this.marketplace.buyNFT(tokenId, buyerWallet);
  }
}