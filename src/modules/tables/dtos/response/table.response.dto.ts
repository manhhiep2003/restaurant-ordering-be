import { ApiResponseProperty } from '@nestjs/swagger';
import { TableStatus } from '@prisma/client';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';

export class TableResponseDto extends BaseResponseDto {
  @ApiResponseProperty()
  name: string;

  @ApiResponseProperty()
  status: TableStatus;
}
