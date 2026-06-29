import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { Table, TableStatus } from '@prisma/client';
import { QueryPaginationDto } from 'src/common/dtos/query-pagination.dto';
import { PaginateOutput, paginate, paginateOutput } from 'src/common/utils/pagination.util';
import { CreateTableRequestDto } from 'src/modules/tables/dtos/request/create-table.request.dto';
import { UpdateTableRequestDto } from 'src/modules/tables/dtos/request/update-table.request.dto';
import { TableResponseDto } from 'src/modules/tables/dtos/response/table.response.dto';
import { TableMapper } from 'src/modules/tables/mappers/table.mapper';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TableService {
  constructor(
    private prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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

  /**
   * Khởi tạo một phiên ăn mới cho bàn (Mở bàn)
   * Quyền truy cập: STAFF / ADMIN
   */
  async openTable(id: string): Promise<TableResponseDto> {
    // 1. Kiểm tra xem bàn có tồn tại trong hệ thống PostgreSQL không
    await this.getTableById(id);

    // 2. Định nghĩa cái key riêng biệt cho bàn này trong Redis
    const redisKey = `table_session:${id}`;

    // 3. Chui vào Redis kiểm tra xem bàn này đã được mở từ trước chưa
    const isTableOpen = await this.cacheManager.get<boolean>(redisKey);
    if (isTableOpen) {
      throw new ConflictException('Bàn này hiện đang có khách ngồi ăn');
    }

    // 4. Nếu bàn đang trống, lưu trạng thái mở bàn vào Redis
    // Thời gian hết hạn (TTL) là 4 tiếng = 4 * 60 * 60 * 1000 mili-giây
    const FOUR_HOURS_MS = 14400000;
    await this.cacheManager.set(redisKey, true, FOUR_HOURS_MS);

    // 5. Đồng bộ cập nhật trạng thái bàn sang OCCUPIED trong PostgreSQL
    const updatedTable = await this.prismaService.table.update({
      where: { id },
      data: { status: TableStatus.OCCUPIED },
    });

    // 6. Trả về thông tin bàn sau khi mở thành công
    return TableMapper.toResponse(updatedTable);
  }

  /**
   * Kết thúc phiên ăn của bàn (Đóng bàn khi thanh toán xong)
   * Quyền truy cập: STAFF / ADMIN
   */
  async closeTable(id: string): Promise<TableResponseDto> {
    // 1. Kiểm tra xem bàn có tồn tại không
    await this.getTableById(id);

    const redisKey = `table_session:${id}`;

    // 2. Xóa sạch dấu vết phiên ăn (Session) của bàn này khỏi Redis
    await this.cacheManager.del(redisKey);

    // 3. Chuyển trạng thái bàn về AVAILABLE (Sẵn sàng đón khách mới) trong PostgreSQL
    const updatedTable = await this.prismaService.table.update({
      where: { id },
      data: { status: TableStatus.AVAILABLE },
    });

    return TableMapper.toResponse(updatedTable);
  }

  /**
   * Kiểm tra trạng thái phiên ăn của bàn khi khách quét mã QR
   * Quyền truy cập: PUBLIC (Khách hàng)
   */
  async checkTableStatus(id: string): Promise<{ isOpen: boolean }> {
    // 1. Kiểm tra xem bàn có thực sự tồn tại trong hệ thống PostgreSQL không
    // Hàm getTableById của bạn sẽ tự động ném ra NotFoundException (404) nếu id bàn không hợp lệ
    await this.getTableById(id);

    const redisKey = `table_session:${id}`;

    // 2. Tra cứu trên Cloud Redis xem bàn này có phiên bận (ACTIVE) không
    const isTableOpen = await this.cacheManager.get<boolean>(redisKey);

    // 3. Nếu không tìm thấy key trên Redis, nghĩa là bàn chưa được nhân viên bấm "Mở bàn"
    if (!isTableOpen) {
      throw new ForbiddenException('Bàn chưa được kích hoạt, vui lòng liên hệ nhân viên để mở bàn');
    }

    // 4. Bàn hợp lệ, trả về tín hiệu cho Frontend chuyển hướng vào trang Menu gọi món
    return { isOpen: true };
  }
}
