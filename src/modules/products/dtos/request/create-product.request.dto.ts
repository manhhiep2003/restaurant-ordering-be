import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductRequestDto {
  @ApiProperty({
    example: 'd5d4b7b7-76fc-49ce-a57c-9f489dcfbab3',
    description: 'Category ID',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    example: 'Ba chỉ bò Mỹ',
    description: 'Product name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({
    example: 249000,
    description: 'Product price',
  })
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    example: 'https://example.com/images/steak.jpg',
    description: 'Product image URL',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the product is available',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
