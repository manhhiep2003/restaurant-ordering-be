import { Module } from '@nestjs/common';
import { OrderController } from 'src/modules/orders/order.controller';
import { OrderService } from 'src/modules/orders/order.service';

@Module({
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
