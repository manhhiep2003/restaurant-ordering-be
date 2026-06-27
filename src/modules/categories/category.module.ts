import { Module } from '@nestjs/common';
import { CategoryController } from 'src/modules/categories/category.controller';
import { CategoryService } from 'src/modules/categories/category.service';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
