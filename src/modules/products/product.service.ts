import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '@prisma/client';
import { QueryPaginationDto } from 'src/common/dtos/query-pagination.dto';
import { PaginateOutput, paginate, paginateOutput } from 'src/common/utils/pagination.util';
import { CreateProductRequestDto } from 'src/modules/products/dtos/request/create-product.request.dto';
import { UpdateProductRequestDto } from 'src/modules/products/dtos/request/update-product.request.dto';
import { ProductResponseDto } from 'src/modules/products/dtos/response/product.response.dto';
import { ProductMapper } from 'src/modules/products/mappers/product.mapper';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private prismaService: PrismaService) {}

  async getAllProducts(
    query: QueryPaginationDto = {},
  ): Promise<PaginateOutput<ProductResponseDto>> {
    const [products, total] = await Promise.all([
      this.prismaService.product.findMany({
        ...paginate(query),
      }),
      this.prismaService.product.count(),
    ]);

    return paginateOutput<Product>(ProductMapper.toResponses(products), total, query);
  }

  async getProductById(id: string): Promise<ProductResponseDto> {
    const product = await this.prismaService.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return ProductMapper.toResponse(product);
  }

  async createProduct(data: CreateProductRequestDto): Promise<ProductResponseDto> {
    const [category, existedProduct] = await Promise.all([
      this.prismaService.category.findUnique({
        where: {
          id: data.categoryId,
        },
      }),
      this.prismaService.product.findUnique({
        where: {
          name: data.name,
        },
      }),
    ]);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (existedProduct) {
      throw new ConflictException('Product already exists');
    }

    const product = await this.prismaService.product.create({
      data,
    });

    return ProductMapper.toResponse(product);
  }

  async updateProduct(id: string, data: UpdateProductRequestDto): Promise<ProductResponseDto> {
    await this.getProductById(id);

    if (data.categoryId) {
      const category = await this.prismaService.category.findUnique({
        where: {
          id: data.categoryId,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    if (data.name) {
      const existedProduct = await this.prismaService.product.findFirst({
        where: {
          name: data.name,
          NOT: {
            id,
          },
        },
      });

      if (existedProduct) {
        throw new ConflictException('Product already exists');
      }
    }

    const updatedProduct = await this.prismaService.product.update({
      where: {
        id,
      },
      data,
    });

    return ProductMapper.toResponse(updatedProduct);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.getProductById(id);

    await this.prismaService.product.delete({
      where: { id },
    });
  }
}
