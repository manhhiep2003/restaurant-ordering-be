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
import { ProductService } from 'src/modules/products/product.service';
import { CreateProductRequestDto } from 'src/modules/products/dtos/request/create-product.request.dto';
import { UpdateProductRequestDto } from 'src/modules/products/dtos/request/update-product.request.dto';
import { ProductResponseDto } from 'src/modules/products/dtos/response/product.response.dto';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiBearerAuth()
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAllProducts(
    @Query() query?: QueryPaginationDto,
  ): Promise<PaginateOutput<ProductResponseDto>> {
    return this.productService.getAllProducts(query);
  }

  @Get(':id')
  async getProductById(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productService.getProductById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createProduct(@Body() body: CreateProductRequestDto): Promise<ProductResponseDto> {
    return this.productService.createProduct(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateProduct(
    @Param('id') id: string,
    @Body() body: UpdateProductRequestDto,
  ): Promise<ProductResponseDto> {
    return this.productService.updateProduct(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(@Param('id') id: string): Promise<void> {
    return this.productService.deleteProduct(id);
  }
}
