import { Category } from '@prisma/client';
import { CategotyResponseDto } from 'src/modules/categories/dtos/response/category.response.dto';

export class CategoryMapper {
  static toResponse(category: Category): CategotyResponseDto {
    return {
      id: category.id,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  static toResponses(categories: Category[]): CategotyResponseDto[] {
    return categories.map((category) => this.toResponse(category));
  }
}
