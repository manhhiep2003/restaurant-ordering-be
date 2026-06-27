import { ApiResponseProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiResponseProperty()
  id: string;

  @ApiResponseProperty()
  name: string;

  @ApiResponseProperty()
  createdAt: Date;

  @ApiResponseProperty()
  updatedAt: Date | null;
}
