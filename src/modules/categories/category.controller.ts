import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { CreateCategoryRequestDto } from 'src/modules/categories/dtos/request/create-category.request.dto';
import { UpdateCategoryRequestDto } from 'src/modules/categories/dtos/request/update-category.request.dto';
import { CategoryResponseDto } from 'src/modules/categories/dtos/response/category.response.dto';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiBearerAuth()
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getAllCategories(
    @Query() query?: QueryPaginationDto,
  ): Promise<PaginateOutput<CategoryResponseDto>> {
    return this.categoryService.getAllCategories(query);
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string): Promise<CategoryResponseDto> {
    return this.categoryService.getCategoryById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createCategory(@Body() body: CreateCategoryRequestDto): Promise<CategoryResponseDto> {
    return this.categoryService.createCategory(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateCategory(
    @Param('id') id: string,
    @Body() body: UpdateCategoryRequestDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.updateCategory(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(@Param('id') id: string): Promise<void> {
    return this.categoryService.deleteCategory(id);
  }
}
