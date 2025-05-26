import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  notifyUser(userId: string, notif: any) {
    this.server.to(userId).emit('notification', notif);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    client.join(userId);
  }
}