import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsOptional } from 'class-validator';

export class DiningSessionRequestDto {
  @ApiProperty({
    description: 'ID của bàn đang gọi món',
    example: '9d4b8d14-7e5f-4b35-86b3-0c28dff7e1d4',
  })
  @IsUUID()
  @IsNotEmpty()
  tableId: string;

  @ApiPropertyOptional({
    description: 'Tên khách hàng',
    example: 'Nguyễn Văn A',
  })
  @IsOptional()
  customerName?: string;
}
