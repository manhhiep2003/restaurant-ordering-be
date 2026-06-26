import { Category } from '@prisma/client';
import { CategoryResponseDto } from 'src/modules/categories/dtos/response/category.response.dto';

export class CategoryMapper {
  static toResponse(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  static toResponses(categories: Category[]): CategoryResponseDto[] {
    return categories.map((category) => this.toResponse(category));
  }
}
