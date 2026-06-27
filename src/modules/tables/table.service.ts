import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Table } from '@prisma/client';
import { QueryPaginationDto } from 'src/common/dtos/query-pagination.dto';
import { PaginateOutput, paginate, paginateOutput } from 'src/common/utils/pagination.util';
import { CreateTableRequestDto } from 'src/modules/tables/dtos/request/create-table.request.dto';
import { UpdateTableRequestDto } from 'src/modules/tables/dtos/request/update-table.request.dto';
import { TableResponseDto } from 'src/modules/tables/dtos/response/table.response.dto';
import { TableMapper } from 'src/modules/tables/mappers/table.mapper';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TableService {
  constructor(private prismaService: PrismaService) {}

  async getAllTables(query: QueryPaginationDto = {}): Promise<PaginateOutput<TableResponseDto>> {
    const [tables, total] = await Promise.all([
      this.prismaService.table.findMany({
        ...paginate(query),
      }),
      this.prismaService.table.count(),
    ]);

    return paginateOutput<Table>(TableMapper.toResponses(tables), total, query);
  }

  async getTableById(id: string): Promise<TableResponseDto> {
    const table = await this.prismaService.table.findUnique({
      where: { id },
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return TableMapper.toResponse(table);
  }

  async createTable(data: CreateTableRequestDto): Promise<TableResponseDto> {
    const existed = await this.prismaService.table.findFirst({
      where: {
        name: data.name,
      },
    });

    if (existed) {
      throw new ConflictException('Table already exists');
    }

    const table = await this.prismaService.table.create({
      data,
    });

    return TableMapper.toResponse(table);
  }

  async updateTable(id: string, data: UpdateTableRequestDto): Promise<TableResponseDto> {
    await this.getTableById(id);

    if (data.name && typeof data.name === 'string') {
      const existed = await this.prismaService.table.findFirst({
        where: {
          name: data.name,
          NOT: {
            id,
          },
        },
      });

      if (existed) {
        throw new ConflictException('Table already exists');
      }
    }

    const updatedTable = await this.prismaService.table.update({
      where: { id },
      data,
    });

    return TableMapper.toResponse(updatedTable);
  }

  async deleteTable(id: string): Promise<void> {
    await this.getTableById(id);

    await this.prismaService.table.delete({
      where: { id },
    });
  }
}
