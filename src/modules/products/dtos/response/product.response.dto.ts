import { ApiResponseProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';

export class ProductResponseDto extends BaseResponseDto {
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
  isBuffet: boolean;
}
