import { Product } from '@prisma/client';
import { ProductResponseDto } from 'src/modules/products/dtos/response/product.response.dto';

export class ProductMapper {
  static toResponse(product: Product): ProductResponseDto {
    return {
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      isAvailable: product.isAvailable,
      isBuffet: product.isBuffet,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  static toResponses(products: Product[]): ProductResponseDto[] {
    return products.map((product) => this.toResponse(product));
  }
}
