import { Module } from '@nestjs/common';
import { OrderController } from 'src/modules/orders/order.controller';
import { OrderGateway } from 'src/modules/orders/order.gateway';
import { OrderService } from 'src/modules/orders/order.service';

@Module({
  providers: [OrderService, OrderGateway],
  controllers: [OrderController],
})
export class OrderModule {}
