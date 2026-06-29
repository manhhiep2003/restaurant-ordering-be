// order-item.response.dto.ts
import { ApiResponseProperty } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiResponseProperty()
  id: string;

  @ApiResponseProperty()
  quantity: number;

  @ApiResponseProperty()
  unitPrice: number;

  @ApiResponseProperty()
  note: string | null;

  @ApiResponseProperty()
  productId: string;

  @ApiResponseProperty()
  productName: string;
}
