import { ApiResponseProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

export class ProductResponseDto {
  @ApiResponseProperty()
  id: string;

  @ApiResponseProperty()
  categoryId: string;

  @ApiResponseProperty()
  name: string;

  @ApiResponseProperty()
  price: Prisma.Decimal;

  @ApiResponseProperty()
  imageUrl: string | null;

  @ApiResponseProperty()
  isAvailable: boolean;

  @ApiResponseProperty()
  createdAt: Date;

  @ApiResponseProperty()
  updatedAt: Date | null;
}
