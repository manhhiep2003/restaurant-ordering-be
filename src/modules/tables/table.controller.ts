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
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiBearerAuth()
@Controller('tables')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllTables(
    @Query() query?: QueryPaginationDto,
  ): Promise<PaginateOutput<TableResponseDto>> {
    return this.tableService.getAllTables(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getTableById(@Param('id') id: string): Promise<TableResponseDto> {
    return this.tableService.getTableById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createTable(@Body() body: CreateTableRequestDto): Promise<TableResponseDto> {
    return this.tableService.createTable(body);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
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

  @Post(':id/open')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  async openTable(@Param('id') id: string): Promise<TableResponseDto> {
    return this.tableService.openTable(id);
  }

  @Post(':id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  async closeTable(@Param('id') id: string): Promise<TableResponseDto> {
    return this.tableService.closeTable(id);
  }

  @Get(':id/status')
  async checkTableStatus(@Param('id') id: string): Promise<{ isOpen: boolean }> {
    return this.tableService.checkTableStatus(id);
  }
}
