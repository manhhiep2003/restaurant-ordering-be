import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/modules/users/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CategoryModule } from 'src/modules/categories/category.module';
import { ProductModule } from 'src/modules/products/product.module';
import { TableModule } from 'src/modules/tables/table.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { OrderModule } from 'src/modules/orders/order.module';
import { DiningSessionModule } from 'src/modules/dining-sessions/dining-session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        stores: [new KeyvRedis(configService.getOrThrow<string>('REDIS_URL'))],
      }),
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    CategoryModule,
    ProductModule,
    TableModule,
    OrderModule,
    DiningSessionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
