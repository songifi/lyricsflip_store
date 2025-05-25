import type { LiveStream, StreamStatus, StreamType, StreamQuality } from "../entities/livestream.entity"

export class LiveStreamResponseDto {
  id: string
  title: string
  description?: string
  type: StreamType
  status: StreamStatus
  scheduledStartTime: Date
  actualStartTime?: Date
  endTime?: Date
  maxViewers: number
  ticketPrice?: number
  isPayPerView: boolean
  isChatEnabled: boolean
  isRecordingEnabled: boolean
  maxQuality: StreamQuality
  thumbnailUrl?: string
  hlsUrl?: string
  artistId: string
  eventId?: string
  createdAt: Date
  updatedAt: Date

  constructor(liveStream: LiveStream) {
    this.id = liveStream.id
    this.title = liveStream.title
    this.description = liveStream.description
    this.type = liveStream.type
    this.status = liveStream.status
    this.scheduledStartTime = liveStream.scheduledStartTime
    this.actualStartTime = liveStream.actualStartTime
    this.endTime = liveStream.endTime
    this.maxViewers = liveStream.maxViewers
    this.ticketPrice = liveStream.ticketPrice
    this.isPayPerView = liveStream.isPayPerView
    this.isChatEnabled = liveStream.isChatEnabled
    this.isRecordingEnabled = liveStream.isRecordingEnabled
    this.maxQuality = liveStream.maxQuality
    this.thumbnailUrl = liveStream.thumbnailUrl
    this.hlsUrl = liveStream.hlsUrl
    this.artistId = liveStream.artistId
    this.eventId = liveStream.eventId
    this.createdAt = liveStream.createdAt
    this.updatedAt = liveStream.updatedAt
  }
}
