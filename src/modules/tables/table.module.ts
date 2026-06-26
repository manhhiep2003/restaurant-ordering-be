import { Module } from '@nestjs/common';
import { TableController } from 'src/modules/tables/table.controller';
import { TableService } from 'src/modules/tables/table.service';

@Module({
  controllers: [TableController],
  providers: [TableService],
})
export class TableModule {}
