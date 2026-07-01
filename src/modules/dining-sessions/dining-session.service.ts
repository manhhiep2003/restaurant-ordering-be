import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { DiningSessionRequestDto } from 'src/modules/dining-sessions/dtos/request/dining-session.request.dto';
import { TableStatus } from '@prisma/client';

@Injectable()
export class DiningSessionService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Khởi tạo hoặc lấy ra Phiên ăn hiện tại khi khách quét mã QR
   */
  async checkOrCreateSession(data: DiningSessionRequestDto) {
    const redisKey = `table_session:${data.tableId}`;
    console.log('redisKey', redisKey);

    // 1. Kiểm tra trên cache Redis xem bàn này đã có phiên ăn chưa
    const cachedSessionId = await this.cacheManager.get<string>(redisKey);

    if (cachedSessionId) {
      return { sessionId: cachedSessionId, isNew: false };
    }

    // 2. Nếu Redis không có, kiểm tra trạng thái bàn dưới DB
    const table = await this.prisma.table.findUnique({ where: { id: data.tableId } });
    if (!table) throw new NotFoundException('Không tìm thấy bàn này trong hệ thống');

    // Trường hợp: Bàn đang OCCUPIED nhưng Redis bị mất cache (do restart hoặc hết hạn)
    if (table.status === TableStatus.OCCUPIED) {
      const activeSession = await this.prisma.diningSession.findFirst({
        where: { tableId: data.tableId, isClosed: false },
        orderBy: { startTime: 'desc' },
      });

      if (activeSession) {
        // Ghi lại vào Redis để các request sau chạy nhanh hơn
        await this.cacheManager.set(redisKey, activeSession.id, 0); // 0 = không bao giờ hết hạn cho đến khi xóa
        return { sessionId: activeSession.id, isNew: false };
      }

      // Nếu trạng thái bàn bận nhưng không tìm thấy session bận -> Dữ liệu xung đột, ép về trống để xử lý tiếp
      await this.prisma.table.update({
        where: { id: data.tableId },
        data: { status: TableStatus.AVAILABLE },
      });
    }

    // 3. Trường hợp: Bàn thực sự đang trống (AVAILABLE) -> Tiến hành mở Phiên ăn mới
    const newSession = await this.prisma.$transaction(async (tx) => {
      // Bước A: Tạo Dining Session mới
      const session = await tx.diningSession.create({
        data: {
          tableId: data.tableId,
          customerName: data.customerName || 'Khách vãng lai',
          isClosed: false,
        },
      });

      // Bước B: Chuyển trạng thái bàn sang OCCUPIED
      await tx.table.update({
        where: { id: data.tableId },
        data: { status: TableStatus.OCCUPIED },
      });

      return session;
    });
    console.log('newSession', newSession);

    // 4. Lưu ID phiên ăn mới vào Redis để quản lý realtime
    await this.cacheManager.set(redisKey, newSession.id, 0);

    return { sessionId: newSession.id, isNew: true };
  }
}
