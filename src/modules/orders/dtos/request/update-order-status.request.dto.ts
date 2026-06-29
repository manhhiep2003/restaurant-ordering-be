import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateOrderStatusRequestDto {
  @ApiProperty({
    enum: OrderStatus,
    enumName: 'OrderStatus',
    example: OrderStatus.PENDING,
    description: `
    Trạng thái của đơn hàng.
    - PENDING: Chờ xác nhận
    - COOKING: Đang chế biến
    - SERVED: Đã phục vụ
    - PAID: Đã thanh toán
    - CANCELLED: Đã hủy
  `,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
