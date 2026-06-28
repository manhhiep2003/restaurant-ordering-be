import { ApiResponseProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { OrderItemResponseDto } from './order-item.response.dto';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';

export class OrderResponseDto extends BaseResponseDto {
  @ApiResponseProperty()
  tableId: string;

  @ApiResponseProperty()
  tableName: string;

  @ApiResponseProperty()
  status: OrderStatus;

  @ApiResponseProperty()
  totalPrice: number;

  @ApiResponseProperty({
    type: () => [OrderItemResponseDto],
  })
  orderItems: OrderItemResponseDto[];
}
