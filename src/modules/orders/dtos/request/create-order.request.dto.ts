import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Định nghĩa cấu trúc của 1 món ăn trong đơn hàng
export class OrderItemDto {
  @ApiProperty({
    description: 'ID của món ăn',
    example: '8b2d43d8-3e2c-4e4f-99c4-8fdf5cfa2e8b',
  })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Số lượng món khách gọi',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  quantity: number;

  @ApiPropertyOptional({
    description: 'Ghi chú cho món ăn',
    example: 'Ít cay, không hành',
  })
  @IsString()
  @IsOptional()
  note?: string;
}

// Payload tạo đơn hàng
export class CreateOrderRequestDto {
  @ApiProperty({
    description: 'ID của session bàn đang gọi món',
    example: '9d4b8d14-7e5f-4b35-86b3-0c28dff7e1d4',
  })
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: 'Danh sách món ăn khách đặt',
    type: [OrderItemDto],
    example: [
      {
        productId: '8b2d43d8-3e2c-4e4f-99c4-8fdf5cfa2e8b',
        quantity: 2,
        note: 'Ít cay',
      },
      {
        productId: '4e8f5cfa-2e8b-43d8-99c4-3e2c8b2d43d8',
        quantity: 1,
        note: 'Không hành',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
