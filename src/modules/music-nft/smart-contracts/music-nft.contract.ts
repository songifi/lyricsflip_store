import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as contractABI from './MusicNFTABI.json';

@Injectable()
export class MusicNFTContract {
  private provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC);
  private wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY!, this.provider);
  private contractAddress = process.env.NFT_CONTRACT_ADDRESS!;
  private contract = new ethers.Contract(this.contractAddress, contractABI, this.wallet);

  async mintNFT(to: string, metadataUri: string, royalty: number): Promise<string> {
    const tx = await this.contract.mint(to, metadataUri, royalty);
    const receipt = await tx.wait();
    return receipt.logs[0]?.topics[0] || 'minted';
  }

  async verifyOwnership(tokenId: string, walletAddress: string): Promise<boolean> {
    const owner = await this.contract.ownerOf(tokenId);
    return owner.toLowerCase() === walletAddress.toLowerCase();
  }

  async transferNFT(tokenId: string, to: string): Promise<any> {
    return await this.contract.transferFrom(this.wallet.address, to, tokenId);
  }
}