import { Controller, Get, Param } from '@nestjs/common';
import { ContextService } from '../services/context.service';

@Controller('context')
export class ContextController {
  constructor(private readonly service: ContextService) {}

  @Get(':userId')
  analyze(@Param('userId') userId: string) {
    return this.service.analyzeContext(userId);
  }
}
