import { Controller, Get, Query } from '@nestjs/common';
import { SimilarityService } from '../services/similarity.service';

@Controller('similarity')
export class SimilarityController {
  constructor(private readonly service: SimilarityService) {}

  @Get()
  findSimilar(@Query('userId') userId: string) {
    return this.service.findSimilar(userId);
  }
}
