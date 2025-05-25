import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
} from "@nestjs/websockets"
import type { Server, Socket } from "socket.io"
import { Logger } from "@nestjs/common"
import type { LiveStreamService } from "../livestream.service"
import type { SendChatMessageDto } from "../dto/send-chat-message.dto"

interface AuthenticatedSocket extends Socket {
  userId?: string
}

@WebSocketGateway({
  namespace: "/livestream",
  cors: {
    origin: "*",
  },
})
export class LiveStreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(LiveStreamGateway.name)
  private activeViewers: Map<string, Set<string>> = new Map() // streamId -> Set of userIds

  constructor(private liveStreamService: LiveStreamService) {}

  async handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${client.id}`)
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`)

    // Remove user from all streams they were watching
    for (const [streamId, viewers] of this.activeViewers.entries()) {
      if (viewers.has(client.userId)) {
        viewers.delete(client.userId)

        // Broadcast updated viewer count
        this.server.to(`stream-${streamId}`).emit("viewerCountUpdate", {
          streamId,
          viewerCount: viewers.size,
        })

        // Record analytics
        await this.liveStreamService.recordAnalytics(streamId, {
          viewerCount: viewers.size,
        })
      }
    }
  }

  @SubscribeMessage("joinStream")
  async handleJoinStream(data: { streamId: string; userId: string }, client: AuthenticatedSocket) {
    const { streamId, userId } = data
    client.userId = userId

    try {
      // Check if user has access to the stream
      const hasAccess = await this.liveStreamService.checkAccess(streamId, userId)

      if (!hasAccess) {
        client.emit("error", { message: "Access denied. Payment required." })
        return
      }

      // Join the stream room
      await client.join(`stream-${streamId}`)

      // Add to active viewers
      if (!this.activeViewers.has(streamId)) {
        this.activeViewers.set(streamId, new Set())
      }
      this.activeViewers.get(streamId).add(userId)

      const viewerCount = this.activeViewers.get(streamId).size

      // Send current viewer count to the user
      client.emit("joinedStream", {
        streamId,
        viewerCount,
        message: "Successfully joined the stream",
      })

      // Broadcast updated viewer count to all viewers
      this.server.to(`stream-${streamId}`).emit("viewerCountUpdate", {
        streamId,
        viewerCount,
      })

      // Load and send recent chat messages
      const recentMessages = await this.liveStreamService.getChatHistory(streamId, 20)
      client.emit("chatHistory", recentMessages)

      // Record analytics
      await this.liveStreamService.recordAnalytics(streamId, {
        viewerCount,
      })

      this.logger.log(`User ${userId} joined stream ${streamId}`)
    } catch (error) {
      this.logger.error(`Error joining stream: ${error.message}`)
      client.emit("error", { message: "Failed to join stream" })
    }
  }

  @SubscribeMessage("leaveStream")
  async handleLeaveStream(@MessageBody() data: { streamId: string }, @ConnectedSocket() client: AuthenticatedSocket) {
    const { streamId } = data
    const userId = client.userId

    if (!userId) return

    try {
      // Leave the stream room
      await client.leave(`stream-${streamId}`)

      // Remove from active viewers
      if (this.activeViewers.has(streamId)) {
        this.activeViewers.get(streamId).delete(userId)

        const viewerCount = this.activeViewers.get(streamId).size

        // Broadcast updated viewer count
        this.server.to(`stream-${streamId}`).emit("viewerCountUpdate", {
          streamId,
          viewerCount,
        })

        // Record analytics
        await this.liveStreamService.recordAnalytics(streamId, {
          viewerCount,
        })
      }

      client.emit("leftStream", { streamId })
      this.logger.log(`User ${userId} left stream ${streamId}`)
    } catch (error) {
      this.logger.error(`Error leaving stream: ${error.message}`)
    }
  }

  @SubscribeMessage("sendChatMessage")
  async handleChatMessage(
    @MessageBody() data: { streamId: string; message: SendChatMessageDto },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { streamId, message } = data
    const userId = client.userId

    if (!userId) {
      client.emit("error", { message: "Authentication required" })
      return
    }

    try {
      // Save the chat message
      const chatMessage = await this.liveStreamService.sendChatMessage(streamId, userId, message)

      // Broadcast the message to all viewers in the stream
      this.server.to(`stream-${streamId}`).emit("newChatMessage", {
        id: chatMessage.id,
        message: chatMessage.message,
        type: chatMessage.type,
        user: chatMessage.user,
        createdAt: chatMessage.createdAt,
        metadata: chatMessage.metadata,
      })

      this.logger.log(`Chat message sent in stream ${streamId} by user ${userId}`)
    } catch (error) {
      this.logger.error(`Error sending chat message: ${error.message}`)
      client.emit("error", { message: "Failed to send message" })
    }
  }

  @SubscribeMessage("reportQuality")
  async handleQualityReport(
    @MessageBody() data: {
      streamId: string;
      quality: string;
      bitrate: number;
      bufferingTime: number;
      connectionSpeed: number;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { streamId, quality, bitrate, bufferingTime, connectionSpeed } = data
    const userId = client.userId

    if (!userId) return

    try {
      // Record quality metrics in analytics
      await this.liveStreamService.recordAnalytics(streamId, {
        userId,
        qualityMetrics: {
          quality,
          bitrate,
          buffering: bufferingTime,
        },
      })

      this.logger.log(`Quality report for stream ${streamId}: ${quality} @ ${bitrate}kbps`)
    } catch (error) {
      this.logger.error(`Error recording quality metrics: ${error.message}`)
    }
  }

  // Method to broadcast stream status updates
  async broadcastStreamUpdate(streamId: string, update: any) {
    this.server.to(`stream-${streamId}`).emit("streamUpdate", {
      streamId,
      ...update,
    })
  }

  // Method to broadcast system messages
  async broadcastSystemMessage(streamId: string, message: string) {
    this.server.to(`stream-${streamId}`).emit("systemMessage", {
      message,
      timestamp: new Date(),
    })
  }

  // Get current viewer count for a stream
  getViewerCount(streamId: string): number {
    return this.activeViewers.get(streamId)?.size || 0
  }
}
