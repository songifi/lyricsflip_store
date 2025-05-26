import { Injectable } from '@nestjs/common';

@Injectable()
export class MarketplaceService {
  private listings = new Map<string, any>();

  listNFT(tokenId: string, price: number, sellerWallet: string) {
    this.listings.set(tokenId, {
      price,
      seller: sellerWallet,
      listedAt: new Date(),
    });
    return { tokenId, price, seller: sellerWallet };
  }

  buyNFT(tokenId: string, buyerWallet: string) {
    const listing = this.listings.get(tokenId);
    if (!listing) throw new Error('NFT not listed');
    this.listings.delete(tokenId);
    return { tokenId, buyer: buyerWallet };
  }

  getMarketplace() {
    return Array.from(this.listings.values());
  }
}