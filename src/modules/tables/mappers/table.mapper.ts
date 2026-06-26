import { Table } from '@prisma/client';
import { TableResponseDto } from 'src/modules/tables/dtos/response/table.response.dto';

export class TableMapper {
  static toResponse(table: Table): TableResponseDto {
    return {
      id: table.id,
      name: table.name,
      status: table.status,
      createdAt: table.createdAt,
      updatedAt: table.updatedAt,
    };
  }

  static toResponses(tables: Table[]): TableResponseDto[] {
    return tables.map((table) => this.toResponse(table));
  }
}
