import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryRequestDto } from 'src/modules/categories/dtos/create-category.request.dto';

export class UpdateCategoryRequestDto extends PartialType(CreateCategoryRequestDto) {}
