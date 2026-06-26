import { ApiResponseProperty } from '@nestjs/swagger';

export abstract class BaseResponseDto {
  @ApiResponseProperty()
  id: string;

  @ApiResponseProperty()
  createdAt: Date;

  @ApiResponseProperty()
  updatedAt: Date | null;
}
