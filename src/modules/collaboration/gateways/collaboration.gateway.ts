import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  type OnGatewayConnection,
  type OnGatewayDisconnection,
  WebSocketServer,
} from "@nestjs/websockets"
import type { Server, Socket } from "socket.io"
import { UseGuards, Logger } from "@nestjs/common"
import { WsJwtGuard } from "../../auth/guards/ws-jwt.guard"

interface CollaborationSession {
  userId: string
  projectId: string
  userName: string
  joinedAt: Date
  lastActivity: Date
}

@WebSocketGateway({
  namespace: "/collaboration",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})
export class CollaborationGateway implements OnGatewayConnection, OnGatewayDisconnection {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(CollaborationGateway.name)
  private activeSessions = new Map<string, CollaborationSession>()
  private projectRooms = new Map<string, Set<string>>() // projectId -> socketIds

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)
  }

  async handleDisconnection(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)

    const session = this.activeSessions.get(client.id)
    if (session) {
      // Remove from project room
      const projectRoom = this.projectRooms.get(session.projectId)
      if (projectRoom) {
        projectRoom.delete(client.id)
        if (projectRoom.size === 0) {
          this.projectRooms.delete(session.projectId)
        }
      }

      // Notify other users in the project
      client.to(`project:${session.projectId}`).emit("userLeft", {
        userId: session.userId,
        userName: session.userName,
      })

      this.activeSessions.delete(client.id)
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("joinProject")
  async handleJoinProject(data: { projectId: string }, @ConnectedSocket() client: Socket) {
    const { projectId } = data
    const user = (client as any).user

    // Create session
    const session: CollaborationSession = {
      userId: user.id,
      projectId,
      userName: user.name || user.email,
      joinedAt: new Date(),
      lastActivity: new Date(),
    }

    this.activeSessions.set(client.id, session)

    // Join project room
    await client.join(`project:${projectId}`)

    // Track in project rooms
    if (!this.projectRooms.has(projectId)) {
      this.projectRooms.set(projectId, new Set())
    }
    this.projectRooms.get(projectId)!.add(client.id)

    // Notify other users in the project
    client.to(`project:${projectId}`).emit("userJoined", {
      userId: user.id,
      userName: session.userName,
    })

    // Send current active users to the new user
    const activeUsers = this.getProjectActiveUsers(projectId)
    client.emit("activeUsers", activeUsers)

    this.logger.log(`User ${user.id} joined project ${projectId}`)
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leaveProject')
  async handleLeaveProject(@ConnectedSocket() client: Socket) {
    const session = this.activeSessions.get(client.id);
    if (session) {
      await client.leave(`project:${session.projectId}`);
      
      // Remove from project room
      const projectRoom = this.projectRooms.get(session.projectId);
      if (projectRoom) {
        projectRoom.delete(client.id);
      }

      // Notify other users
      client.to(`project:${session.projectId}`).emit('userLeft', {
        userId: session.userId,
        userName: session.userName,
      });

      this.activeSessions.delete(client.id);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("audioPlaybackSync")
  async handleAudioPlaybackSync(
    @MessageBody() data: { 
      versionId: string; 
      action: 'play' | 'pause' | 'seek'; 
      timestamp?: number; 
    },
    @ConnectedSocket() client: Socket,
  ) {
    const session = this.activeSessions.get(client.id)
    if (session) {
      session.lastActivity = new Date()

      // Broadcast to other users in the project
      client.to(`project:${session.projectId}`).emit("audioPlaybackSync", {
        ...data,
        userId: session.userId,
        userName: session.userName,
      })
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("cursorPosition")
  async handleCursorPosition(
    @MessageBody() data: { versionId: string; position: number },
    @ConnectedSocket() client: Socket,
  ) {
    const session = this.activeSessions.get(client.id)
    if (session) {
      session.lastActivity = new Date()

      // Broadcast cursor position to other users
      client.to(`project:${session.projectId}`).emit("cursorPosition", {
        ...data,
        userId: session.userId,
        userName: session.userName,
      })
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("liveComment")
  async handleLiveComment(
    @MessageBody() data: { 
      versionId: string; 
      content: string; 
      timestamp: number;
      isTemporary?: boolean;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const session = this.activeSessions.get(client.id)
    if (session) {
      session.lastActivity = new Date()

      // Broadcast live comment to other users
      client.to(`project:${session.projectId}`).emit("liveComment", {
        ...data,
        userId: session.userId,
        userName: session.userName,
        createdAt: new Date(),
      })
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("taskUpdate")
  async handleTaskUpdate(@MessageBody() data: { taskId: string; status: string }, @ConnectedSocket() client: Socket) {
    const session = this.activeSessions.get(client.id)
    if (session) {
      session.lastActivity = new Date()

      // Broadcast task update to other users
      client.to(`project:${session.projectId}`).emit("taskUpdate", {
        ...data,
        userId: session.userId,
        userName: session.userName,
        updatedAt: new Date(),
      })
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("projectActivity")
  async handleProjectActivity(
    @MessageBody() data: { 
      activity: string; 
      description: string;
      metadata?: any;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const session = this.activeSessions.get(client.id)
    if (session) {
      session.lastActivity = new Date()

      // Broadcast activity to other users
      client.to(`project:${session.projectId}`).emit("projectActivity", {
        ...data,
        userId: session.userId,
        userName: session.userName,
        timestamp: new Date(),
      })
    }
  }

  private getProjectActiveUsers(projectId: string): any[] {
    const projectRoom = this.projectRooms.get(projectId)
    if (!projectRoom) return []

    const activeUsers = []
    for (const socketId of projectRoom) {
      const session = this.activeSessions.get(socketId)
      if (session) {
        activeUsers.push({
          userId: session.userId,
          userName: session.userName,
          joinedAt: session.joinedAt,
          lastActivity: session.lastActivity,
        })
      }
    }

    return activeUsers
  }

  // Method to send notifications from services
  notifyProjectMembers(projectId: string, event: string, data: any) {
    this.server.to(`project:${projectId}`).emit(event, data)
  }

  // Method to get active project sessions for analytics
  getProjectActivityMetrics(projectId: string) {
    const projectRoom = this.projectRooms.get(projectId)
    if (!projectRoom) return { activeUsers: 0, sessions: [] }

    const sessions = []
    for (const socketId of projectRoom) {
      const session = this.activeSessions.get(socketId)
      if (session) {
        sessions.push(session)
      }
    }

    return {
      activeUsers: sessions.length,
      sessions,
    }
  }
}
