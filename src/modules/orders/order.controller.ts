import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateOrderRequestDto } from 'src/modules/orders/dtos/request/create-order.request.dto';
import { OrderResponseDto } from 'src/modules/orders/dtos/response/order.response.dto';
import { OrderService } from 'src/modules/orders/order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTable(@Body() body: CreateOrderRequestDto): Promise<OrderResponseDto> {
    return this.orderService.createOrder(body);
  }
}
