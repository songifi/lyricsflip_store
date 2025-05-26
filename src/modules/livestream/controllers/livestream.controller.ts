import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  ParseIntPipe,
} from "@nestjs/common"
import type { LiveStreamService } from "./livestream.service"
import type { PaymentService } from "./payment.service"
import type { StreamingService } from "./streaming.service"
import type { CreateLiveStreamDto } from "./dto/create-livestream.dto"
import type { UpdateLiveStreamDto } from "./dto/update-livestream.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import type { StreamStatus } from "./entities/livestream.entity"

@Controller("livestreams")
@UseGuards(JwtAuthGuard)
export class LiveStreamController {
  constructor(
    private readonly liveStreamService: LiveStreamService,
    private readonly paymentService: PaymentService,
    private readonly streamingService: StreamingService,
  ) {}

  @Post()
  create(@Body() createLiveStreamDto: CreateLiveStreamDto) {
    return this.liveStreamService.create(createLiveStreamDto);
  }

  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('status') status?: StreamStatus,
  ) {
    return this.liveStreamService.findAll(page, limit, status)
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.liveStreamService.findOne(id);
  }

  @Patch(":id")
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateLiveStreamDto: UpdateLiveStreamDto) {
    return this.liveStreamService.update(id, updateLiveStreamDto)
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.liveStreamService.delete(id);
  }

  @Post(':id/start')
  startStream(@Param('id', ParseUUIDPipe) id: string) {
    return this.liveStreamService.startStream(id);
  }

  @Post(':id/end')
  endStream(@Param('id', ParseUUIDPipe) id: string) {
    return this.liveStreamService.endStream(id);
  }

  @Get(":id/access")
  checkAccess(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.liveStreamService.checkAccess(id, req.user.id)
  }

  @Get(":id/analytics")
  getAnalytics(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined
    return this.liveStreamService.getStreamAnalytics(id, start, end)
  }

  @Get(":id/chat")
  getChatHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.liveStreamService.getChatHistory(id, limit)
  }

  @Post(":id/payment")
  createPayment(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.paymentService.createPaymentIntent(req.user.id, id)
  }

  @Get(':id/revenue')
  getRevenue(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentService.getStreamRevenue(id);
  }

  @Get(':id/health')
  async getStreamHealth(@Param('id', ParseUUIDPipe) id: string) {
    const stream = await this.liveStreamService.findOne(id);
    return this.streamingService.getStreamHealth(stream.streamKey);
  }

  @Post(":id/adapt-quality")
  async adaptQuality(@Param('id', ParseUUIDPipe) id: string, @Body() data: { connectionSpeed: number }) {
    const stream = await this.liveStreamService.findOne(id)
    return this.streamingService.adaptStreamQuality(stream.streamKey, data.connectionSpeed)
  }
}
