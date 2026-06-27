import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/modules/users/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CategoryModule } from 'src/modules/categories/category.module';
import { ProductModule } from 'src/modules/products/product.module';
import { TableModule } from 'src/modules/tables/table.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    CategoryModule,
    ProductModule,
    TableModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
