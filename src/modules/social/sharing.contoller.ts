import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SharingService } from './sharing.service';
import { ShareContentDto } from './dto/share-content.dto';

@Controller('sharing')
@UseGuards(JwtAuthGuard)
export class SharingController {
  constructor(private readonly sharingService: SharingService) {}

  @Post()
  async shareContent(@Request() req, @Body() dto: ShareContentDto) {
    return this.sharingService.shareContent(req.user, dto);
  }
}
