import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Category } from '@prisma/client';
import { QueryPaginationDto } from 'src/common/dtos/query-pagination.dto';
import { PaginateOutput, paginate, paginateOutput } from 'src/common/utils/pagination.util';
import { CreateCategoryRequestDto } from 'src/modules/categories/dtos/create-category.request.dto';
import { UpdateCategoryRequestDto } from 'src/modules/categories/dtos/update-category.request.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prismaService: PrismaService) {}

  async getAllCategories(query: QueryPaginationDto = {}): Promise<PaginateOutput<Category>> {
    const [categories, total] = await Promise.all([
      this.prismaService.category.findMany({
        ...paginate(query),
      }),
      this.prismaService.category.count(),
    ]);

    return paginateOutput<Category>(categories, total, query);
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.prismaService.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async createCategory(data: CreateCategoryRequestDto): Promise<Category> {
    const existed = await this.prismaService.category.findFirst({
      where: {
        name: data.name,
      },
    });

    if (existed) {
      throw new ConflictException('Category already exists');
    }

    return this.prismaService.category.create({
      data,
    });
  }

  async updateCategory(id: string, data: UpdateCategoryRequestDto): Promise<Category> {
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

    return this.prismaService.category.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string): Promise<void> {
    await this.getCategoryById(id);

    await this.prismaService.category.delete({
      where: { id },
    });
  }
}
