import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { MusicNFTService } from './music-nft.service';
import { CreateNFTDto } from './dto/create-nft.dto';

@Controller('music-nft')
export class MusicNFTController {
  constructor(private readonly service: MusicNFTService) {}

  @Post()
  create(@Body() dto: CreateNFTDto) {
    return this.service.createNFT(dto);
  }

  @Get('verify/:tokenId/:wallet')
  verify(@Param('tokenId') tokenId: string, @Param('wallet') wallet: string) {
    return this.service.verifyOwnership(tokenId, wallet);
  }

  @Post('list')
  list(@Body() body: { tokenId: string; price: number; wallet: string }) {
    return this.service.listNFT(body.tokenId, body.price, body.wallet);
  }

  @Post('buy')
  buy(@Body() body: { tokenId: string; wallet: string }) {
    return this.service.buyNFT(body.tokenId, body.wallet);
  }
}