import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryRequestDto {
  @ApiProperty({
    example: 'Tráng miệng',
    description: 'Name of category',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
