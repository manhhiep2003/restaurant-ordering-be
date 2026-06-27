import { ApiProperty } from '@nestjs/swagger';
import { TableStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTableRequestDto {
  @ApiProperty({
    example: 'Bàn 1',
    description: 'Table name',
  })
  @IsString()
  @MaxLength(10)
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: TableStatus,
    enumName: 'TableStatus',
    example: TableStatus.AVAILABLE,
    description: 'AVAILABLE: Bàn trống, OCCUPIED: Bàn đang có khách',
  })
  @IsEnum(TableStatus)
  status: TableStatus;
}
