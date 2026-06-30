import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('OrderGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  broadcastNewOrder(orderData: any) {
    this.server.emit('onNewOrder', orderData);
  }

  @SubscribeMessage('callStaff')
  handleCallStaff(@MessageBody() data: { tableId: string; tableName: string }) {
    this.server.emit('onCallStaff', {
      tableId: data.tableId,
      tableName: data.tableName,
      time: new Date().toLocaleTimeString(),
    });
  }
}
