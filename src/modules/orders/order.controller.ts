import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateOrderRequestDto } from 'src/modules/orders/dtos/request/create-order.request.dto';
import { UpdateOrderStatusRequestDto } from 'src/modules/orders/dtos/request/update-order-status.request.dto';
import { OrderResponseDto } from 'src/modules/orders/dtos/response/order.response.dto';
import { OrderService } from 'src/modules/orders/order.service';

@ApiBearerAuth()
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTable(@Body() body: CreateOrderRequestDto): Promise<OrderResponseDto> {
    return this.orderService.createOrder(body);
  }

  // @Patch(':id/status')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.KITCHEN, Role.ADMIN)
  // async updateOrderStatus(
  //   @Param('id') id: string,
  //   @Body() body: UpdateOrderStatusRequestDto,
  // ): Promise<OrderResponseDto> {
  //   return this.orderService.updateOrderStatus(id, body);
  // }

  // @Get('table/:tableId/bill')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.STAFF, Role.ADMIN)
  // getBill(@Param('tableId') tableId: string) {
  //   return this.orderService.getBillByTable(tableId);
  // }

  // @Get('public/table/:tableId/bill')
  // getPublicBill(@Param('tableId') tableId: string) {
  //   return this.orderService.getBillByTable(tableId);
  // }

  // @Post('table/:tableId/checkout')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.STAFF, Role.ADMIN)
  // checkout(@Param('tableId') tableId: string) {
  //   return this.orderService.checkoutTable(tableId);
  // }
}
