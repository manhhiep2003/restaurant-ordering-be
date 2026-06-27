import { PartialType } from '@nestjs/mapped-types';
import { CreateProductRequestDto } from 'src/modules/products/dtos/request/create-product.request.dto';

export class UpdateProductRequestDto extends PartialType(CreateProductRequestDto) {}
