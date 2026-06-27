import { Module } from '@nestjs/common';
import { ProductController } from 'src/modules/products/product.controller';
import { ProductService } from 'src/modules/products/product.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
