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
import { TableService } from 'src/modules/tables/table.service';
import { CreateTableRequestDto } from 'src/modules/tables/dtos/request/create-table.request.dto';
import { UpdateTableRequestDto } from 'src/modules/tables/dtos/request/update-table.request.dto';
import { TableResponseDto } from 'src/modules/tables/dtos/response/table.response.dto';

@ApiBearerAuth()
@Controller('tables')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Get()
  async getAllTables(
    @Query() query?: QueryPaginationDto,
  ): Promise<PaginateOutput<TableResponseDto>> {
    return this.tableService.getAllTables(query);
  }

  @Get(':id')
  async getTableById(@Param('id') id: string): Promise<TableResponseDto> {
    return this.tableService.getTableById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createTable(@Body() body: CreateTableRequestDto): Promise<TableResponseDto> {
    return this.tableService.createTable(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateTable(
    @Param('id') id: string,
    @Body() body: UpdateTableRequestDto,
  ): Promise<TableResponseDto> {
    return this.tableService.updateTable(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTable(@Param('id') id: string): Promise<void> {
    return this.tableService.deleteTable(id);
  }
}
