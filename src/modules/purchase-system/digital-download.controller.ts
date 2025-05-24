import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { DigitalDownloadService } from './digital-download.service';
import { CreateDigitalDownloadDto } from './dto/create-digital-download.dto';
import { UpdateDownloadStatusDto } from './dto/update-download-status.dto';

@Controller('digital-downloads')
export class DigitalDownloadController {
  constructor(private readonly service: DigitalDownloadService) {}

  @Post()
  async create(@Body() dto: CreateDigitalDownloadDto) {
    return await this.service.create(dto);
  }

  @Get(':token')
  async getByToken(@Param('token') token: string) {
    const download = await this.service.findByToken(token);
    if (!download) {
      throw new NotFoundException('Download not found or expired.');
    }
    return download;
  }

  @Patch(':token/status')
  async updateStatus(
    @Param('token') token: string,
    @Body() dto: UpdateDownloadStatusDto,
  ) {
    return await this.service.updateStatus(token, dto.status);
  }

  @Get('user/:userId')
  async getDownloadsForUser(@Param('userId') userId: string) {
    return await this.service.findByUser(userId);
  }
}
