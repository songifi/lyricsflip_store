import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { type Repository, Between } from "typeorm"
import { LiveStream, StreamStatus } from "./entities/livestream.entity"
import { LiveStreamRecording } from "./entities/livestream-recording.entity"
import { LiveStreamAnalytics } from "./entities/livestream-analytics.entity"
import { LiveStreamPayment, PaymentStatus } from "./entities/livestream-payment.entity"
import { LiveStreamChat } from "./entities/livestream-chat.entity"
import type { CreateLiveStreamDto } from "./dto/create-livestream.dto"
import type { UpdateLiveStreamDto } from "./dto/update-livestream.dto"
import { LiveStreamResponseDto } from "./dto/livestream-response.dto"
import type { SendChatMessageDto } from "./dto/send-chat-message.dto"
import type { StreamingService } from "./streaming.service"
import { v4 as uuidv4 } from "uuid"

@Injectable()
export class LiveStreamService {
  constructor(
    @InjectRepository(LiveStream)
    private liveStreamRepository: Repository<LiveStream>,
    @InjectRepository(LiveStreamRecording)
    private recordingRepository: Repository<LiveStreamRecording>,
    @InjectRepository(LiveStreamAnalytics)
    private analyticsRepository: Repository<LiveStreamAnalytics>,
    @InjectRepository(LiveStreamPayment)
    private paymentRepository: Repository<LiveStreamPayment>,
    @InjectRepository(LiveStreamChat)
    private chatRepository: Repository<LiveStreamChat>,
    private streamingService: StreamingService,
  ) {}

  async create(createLiveStreamDto: CreateLiveStreamDto): Promise<LiveStreamResponseDto> {
    const streamKey = this.generateStreamKey()
    const { rtmpUrl, hlsUrl } = await this.streamingService.createStreamEndpoints(streamKey)

    const liveStream = this.liveStreamRepository.create({
      ...createLiveStreamDto,
      streamKey,
      rtmpUrl,
      hlsUrl,
    })

    const savedStream = await this.liveStreamRepository.save(liveStream)
    return new LiveStreamResponseDto(savedStream)
  }

  async findAll(
    page = 1,
    limit = 10,
    status?: StreamStatus,
  ): Promise<{ data: LiveStreamResponseDto[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.liveStreamRepository
      .createQueryBuilder("liveStream")
      .leftJoinAndSelect("liveStream.artist", "artist")
      .leftJoinAndSelect("liveStream.event", "event")

    if (status) {
      queryBuilder.where("liveStream.status = :status", { status })
    }

    const [liveStreams, total] = await queryBuilder
      .orderBy("liveStream.scheduledStartTime", "DESC")
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()

    return {
      data: liveStreams.map((stream) => new LiveStreamResponseDto(stream)),
      total,
      page,
      limit,
    }
  }

  async findOne(id: string): Promise<LiveStreamResponseDto> {
    const liveStream = await this.liveStreamRepository.findOne({
      where: { id },
      relations: ["artist", "event", "recordings", "analytics"],
    })

    if (!liveStream) {
      throw new NotFoundException("Live stream not found")
    }

    return new LiveStreamResponseDto(liveStream)
  }

  async update(id: string, updateLiveStreamDto: UpdateLiveStreamDto): Promise<LiveStreamResponseDto> {
    const liveStream = await this.liveStreamRepository.findOne({ where: { id } })

    if (!liveStream) {
      throw new NotFoundException("Live stream not found")
    }

    // Prevent updating certain fields when stream is live
    if (liveStream.status === StreamStatus.LIVE && updateLiveStreamDto.status !== StreamStatus.ENDED) {
      const restrictedFields = ["scheduledStartTime", "artistId", "eventId"]
      const hasRestrictedUpdates = restrictedFields.some((field) => updateLiveStreamDto[field] !== undefined)

      if (hasRestrictedUpdates) {
        throw new BadRequestException("Cannot update restricted fields while stream is live")
      }
    }

    Object.assign(liveStream, updateLiveStreamDto)
    const updatedStream = await this.liveStreamRepository.save(liveStream)

    return new LiveStreamResponseDto(updatedStream)
  }

  async delete(id: string): Promise<void> {
    const liveStream = await this.liveStreamRepository.findOne({ where: { id } })

    if (!liveStream) {
      throw new NotFoundException("Live stream not found")
    }

    if (liveStream.status === StreamStatus.LIVE) {
      throw new BadRequestException("Cannot delete a live stream that is currently active")
    }

    await this.liveStreamRepository.remove(liveStream)
  }

  async startStream(id: string): Promise<LiveStreamResponseDto> {
    const liveStream = await this.liveStreamRepository.findOne({ where: { id } })

    if (!liveStream) {
      throw new NotFoundException("Live stream not found")
    }

    if (liveStream.status !== StreamStatus.SCHEDULED) {
      throw new BadRequestException("Stream is not in scheduled status")
    }

    liveStream.status = StreamStatus.LIVE
    liveStream.actualStartTime = new Date()

    const updatedStream = await this.liveStreamRepository.save(liveStream)

    // Start recording if enabled
    if (liveStream.isRecordingEnabled) {
      await this.startRecording(id)
    }

    return new LiveStreamResponseDto(updatedStream)
  }

  async endStream(id: string): Promise<LiveStreamResponseDto> {
    const liveStream = await this.liveStreamRepository.findOne({ where: { id } })

    if (!liveStream) {
      throw new NotFoundException("Live stream not found")
    }

    if (liveStream.status !== StreamStatus.LIVE) {
      throw new BadRequestException("Stream is not currently live")
    }

    liveStream.status = StreamStatus.ENDED
    liveStream.endTime = new Date()

    const updatedStream = await this.liveStreamRepository.save(liveStream)

    // Stop recording if it was enabled
    if (liveStream.isRecordingEnabled) {
      await this.stopRecording(id)
    }

    return new LiveStreamResponseDto(updatedStream)
  }

  async checkAccess(streamId: string, userId: string): Promise<boolean> {
    const liveStream = await this.liveStreamRepository.findOne({ where: { id: streamId } })

    if (!liveStream) {
      throw new NotFoundException("Live stream not found")
    }

    // Free streams are accessible to everyone
    if (!liveStream.isPayPerView) {
      return true
    }

    // Check if user has paid for the stream
    const payment = await this.paymentRepository.findOne({
      where: {
        liveStreamId: streamId,
        userId,
        status: PaymentStatus.COMPLETED,
      },
    })

    return !!payment
  }

  async getStreamAnalytics(streamId: string, startDate?: Date, endDate?: Date) {
    const whereCondition: any = { liveStreamId: streamId }

    if (startDate && endDate) {
      whereCondition.timestamp = Between(startDate, endDate)
    }

    const analytics = await this.analyticsRepository.find({
      where: whereCondition,
      order: { timestamp: "ASC" },
    })

    const summary = {
      totalViews: analytics.length,
      peakViewers: Math.max(...analytics.map((a) => a.viewerCount), 0),
      averageViewers: analytics.reduce((sum, a) => sum + a.viewerCount, 0) / (analytics.length || 1),
      totalChatMessages: analytics.reduce((sum, a) => sum + a.chatMessages, 0),
      averageWatchTime: analytics.reduce((sum, a) => sum + a.averageWatchTime, 0) / (analytics.length || 1),
    }

    return {
      summary,
      timeSeries: analytics,
    }
  }

  async recordAnalytics(streamId: string, data: Partial<LiveStreamAnalytics>): Promise<void> {
    const analytics = this.analyticsRepository.create({
      liveStreamId: streamId,
      timestamp: new Date(),
      ...data,
    })

    await this.analyticsRepository.save(analytics)
  }

  async sendChatMessage(streamId: string, userId: string, messageDto: SendChatMessageDto): Promise<LiveStreamChat> {
    const liveStream = await this.liveStreamRepository.findOne({ where: { id: streamId } })

    if (!liveStream) {
      throw new NotFoundException("Live stream not found")
    }

    if (!liveStream.isChatEnabled) {
      throw new ForbiddenException("Chat is disabled for this stream")
    }

    if (liveStream.status !== StreamStatus.LIVE) {
      throw new BadRequestException("Chat is only available during live streams")
    }

    const chatMessage = this.chatRepository.create({
      liveStreamId: streamId,
      userId,
      ...messageDto,
    })

    return await this.chatRepository.save(chatMessage)
  }

  async getChatHistory(streamId: string, limit = 50): Promise<LiveStreamChat[]> {
    return await this.chatRepository.find({
      where: { liveStreamId: streamId, isDeleted: false },
      relations: ["user"],
      order: { createdAt: "DESC" },
      take: limit,
    })
  }

  private async startRecording(streamId: string): Promise<void> {
    const liveStream = await this.liveStreamRepository.findOne({ where: { id: streamId } })

    const recording = this.recordingRepository.create({
      liveStreamId: streamId,
      filename: `${streamId}-${Date.now()}.mp4`,
      fileUrl: "", // Will be set when recording is processed
      fileSize: 0,
      duration: 0,
      recordingStartTime: new Date(),
      recordingEndTime: new Date(), // Will be updated when recording stops
    })

    await this.recordingRepository.save(recording)

    // Start actual recording process with streaming service
    await this.streamingService.startRecording(liveStream.streamKey)
  }

  private async stopRecording(streamId: string): Promise<void> {
    const recording = await this.recordingRepository.findOne({
      where: { liveStreamId: streamId },
      order: { createdAt: "DESC" },
    })

    if (recording) {
      recording.recordingEndTime = new Date()
      await this.recordingRepository.save(recording)

      // Stop actual recording process
      const liveStream = await this.liveStreamRepository.findOne({ where: { id: streamId } })
      await this.streamingService.stopRecording(liveStream.streamKey)
    }
  }

  private generateStreamKey(): string {
    return `stream_${uuidv4().replace(/-/g, "")}`
  }
}
