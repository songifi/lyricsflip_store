export class CreateNFTDto {
  title: string;
  artist: string;
  description: string;
  coverImageUrl: string;
  audioUrl: string;
  ownerWalletAddress: string;
  royaltyPercentage: number;
}