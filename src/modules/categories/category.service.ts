import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Category } from '@prisma/client';
import { QueryPaginationDto } from 'src/common/dtos/query-pagination.dto';
import { PaginateOutput, paginate, paginateOutput } from 'src/common/utils/pagination.util';
import { CreateCategoryRequestDto } from 'src/modules/categories/dtos/request/create-category.request.dto';
import { UpdateCategoryRequestDto } from 'src/modules/categories/dtos/request/update-category.request.dto';
import { CategotyResponseDto } from 'src/modules/categories/dtos/response/category.response.dto';
import { CategoryMapper } from 'src/modules/categories/mappers/category.mapper';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prismaService: PrismaService) {}

  async getAllCategories(
    query: QueryPaginationDto = {},
  ): Promise<PaginateOutput<CategotyResponseDto>> {
    const [categories, total] = await Promise.all([
      this.prismaService.category.findMany({
        ...paginate(query),
      }),
      this.prismaService.category.count(),
    ]);

    return paginateOutput<Category>(CategoryMapper.toResponses(categories), total, query);
  }

  async getCategoryById(id: string): Promise<CategotyResponseDto> {
    const category = await this.prismaService.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return CategoryMapper.toResponse(category);
  }

  async createCategory(data: CreateCategoryRequestDto): Promise<CategotyResponseDto> {
    const existed = await this.prismaService.category.findFirst({
      where: {
        name: data.name,
      },
    });

    if (existed) {
      throw new ConflictException('Category already exists');
    }

    const category = await this.prismaService.category.create({
      data,
    });

    return CategoryMapper.toResponse(category);
  }

  async updateCategory(id: string, data: UpdateCategoryRequestDto): Promise<CategotyResponseDto> {
    await this.getCategoryById(id);

    if (data.name && typeof data.name === 'string') {
      const existed = await this.prismaService.category.findFirst({
        where: {
          name: data.name,
          NOT: {
            id,
          },
        },
      });

      if (existed) {
        throw new ConflictException('Category already exists');
      }
    }

    const updatedCategory = await this.prismaService.category.update({
      where: { id },
      data,
    });

    return CategoryMapper.toResponse(updatedCategory);
  }

  async deleteCategory(id: string): Promise<void> {
    await this.getCategoryById(id);

    await this.prismaService.category.delete({
      where: { id },
    });
  }
}
