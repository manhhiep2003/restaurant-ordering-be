import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { QueryPaginationDto } from 'src/common/dtos/query-pagination.dto';
import { PaginateOutput } from 'src/common/utils/pagination.util';
import { CategoryService } from 'src/modules/categories/category.service';
import { Category } from '@prisma/client';
import { CreateCategoryRequestDto } from 'src/modules/categories/dtos/create-category.request.dto';
import { UpdateCategoryRequestDto } from 'src/modules/categories/dtos/update-category.request.dto';

@ApiBearerAuth()
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAllCategories(@Query() query?: QueryPaginationDto): Promise<PaginateOutput<Category>> {
    return this.categoryService.getAllCategories(query);
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string): Promise<Category> {
    return this.categoryService.getCategoryById(id);
  }

  @Post()
  //@UseGuards(JwtAuthGuard)
  async createCategory(@Body() body: CreateCategoryRequestDto): Promise<Category> {
    return this.categoryService.createCategory(body);
  }

  @Patch(':id')
  //@UseGuards(JwtAuthGuard)
  async updateCategory(
    @Param('id') id: string,
    @Body() body: UpdateCategoryRequestDto,
  ): Promise<Category> {
    return this.categoryService.updateCategory(id, body);
  }

  @Delete(':id')
  //@UseGuards(JwtAuthGuard)
  async deleteCategory(@Param('id') id: string): Promise<void> {
    return this.categoryService.deleteCategory(id);
  }
}
