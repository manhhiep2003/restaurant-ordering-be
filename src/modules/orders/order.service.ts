import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderRequestDto } from 'src/modules/orders/dtos/request/create-order.request.dto';
import { OrderResponseDto } from 'src/modules/orders/dtos/response/order.response.dto';
import { OrderMapper } from 'src/modules/orders/mappers/order.mapper';
import { OrderGateway } from 'src/modules/orders/order.gateway';
import { UpdateOrderStatusRequestDto } from 'src/modules/orders/dtos/request/update-order-status.request.dto';
import { InvoiceStatus, OrderStatus, PaymentMethod, TableStatus } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(
    private prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private orderGateway: OrderGateway,
  ) {}

  async createOrder(data: CreateOrderRequestDto): Promise<OrderResponseDto> {
    // 1. Kiểm tra lại Redis xem bàn còn mở không
    // (Đề phòng khách cố tình giữ màn hình giỏ hàng qua đêm rồi bấm gửi)
    const session = await this.prismaService.diningSession.findUnique({
      where: { id: data.sessionId },
    });

    if (!session || session.isClosed) {
      throw new BadRequestException(
        'Phiên ăn không hợp lý hoặc đã bị đóng, vui lòng quét lại mã QR!',
      );
    }

    // 2. Lấy ID của tất cả các món khách gọi
    const productIds = data.items.map((item) => item.productId);

    // 3. Truy vấn Database để lấy GIÁ GỐC và TRẠNG THÁI thực tế của các món này
    const products = await this.prismaService.product.findMany({
      where: {
        id: { in: productIds },
        isAvailable: true, // Chỉ lấy các món Bếp báo còn hàng
      },
    });

    // Nếu số lượng món lấy được từ DB ít hơn số món khách gửi lên
    // -> Khách đã gọi trúng món vừa mới bị Bếp báo "Hết hàng" hoặc món không tồn tại
    if (products.length !== productIds.length) {
      throw new BadRequestException(
        'Trong giỏ hàng có món ăn đã hết hàng hoặc không tồn tại. Vui lòng tải lại thực đơn.',
      );
    }

    // 4. Tính toán tổng tiền ở Backend & Chuẩn bị dữ liệu cho OrderItem
    let calculatedTotalPrice = 0;

    const orderItemsInput = data.items.map((item) => {
      // Tìm món ăn tương ứng trong danh sách lấy từ DB
      const dbProduct = products.find((p) => p.id === item.productId);

      if (!dbProduct) {
        throw new BadRequestException(`Sản phẩm với id ${item.productId} không tồn tại`);
      }

      // Tính tiền: (Giá DB) x (Số lượng khách gọi)
      calculatedTotalPrice += Number(dbProduct.price) * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: dbProduct.price, // Chốt giá lịch sử vào lúc này
        note: item.note,
      };
    });

    // 5. Lưu vào Database (Dùng Prisma Nested Writes để tạo Order và OrderItem cùng 1 lúc)
    const newOrder = await this.prismaService.order.create({
      data: {
        sessionId: data.sessionId,
        totalPrice: calculatedTotalPrice,
        status: OrderStatus.PENDING,
        // Tạo luôn danh sách các món ăn chi tiết dính kèm với hóa đơn này
        orderItems: {
          create: orderItemsInput,
        },
      },
      // Trả về kèm chi tiết các món ăn để lát nữa ném qua Socket cho Bếp
      include: {
        orderItems: {
          include: {
            product: true, // Lấy tên món ra để Bếp biết đường nấu
          },
        },
      },
    });

    this.orderGateway.broadcastNewOrder(newOrder);

    return OrderMapper.toResponse(newOrder);
  }

  async updateOrderStatus(
    id: string,
    data: UpdateOrderStatusRequestDto,
  ): Promise<OrderResponseDto> {
    const updatedOrder = await this.prismaService.order.update({
      where: { id },
      data: { status: data.status },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    });

    this.orderGateway.server.emit('onOrderStatusChanged', updatedOrder);

    return OrderMapper.toResponse(updatedOrder);
  }

  async getBillByTable(tableId: string) {
    // 1. Tìm phiên ăn đang mở (isClosed: false) của bàn này
    const activeSession = await this.prismaService.diningSession.findFirst({
      where: { tableId: tableId, isClosed: false },
    });

    if (!activeSession) {
      throw new BadRequestException('Bàn này hiện không có phiên ăn nào đang hoạt động');
    }

    const table = await this.prismaService.table.findUnique({ where: { id: tableId } });
    if (!table) throw new NotFoundException('Không tìm thấy bàn yêu cầu');

    const activeOrders = await this.prismaService.order.findMany({
      where: {
        sessionId: activeSession.id,
        status: { in: [OrderStatus.PENDING, OrderStatus.COOKING, OrderStatus.SERVED] },
      },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    });

    // Gom tất cả các món ăn từ nhiều đơn hàng khác nhau lại làm một danh sách tổng
    const billItemsMap = new Map<
      string,
      { productName: string; quantity: number; unitPrice: number; total: number }
    >();
    let grandTotalPrice = 0;

    for (const order of activeOrders) {
      for (const item of order.orderItems) {
        const existing = billItemsMap.get(item.productId);
        const itemTotal = Number(item.unitPrice) * item.quantity;
        grandTotalPrice += itemTotal;

        if (existing) {
          existing.quantity += item.quantity;
          existing.total += itemTotal;
        } else {
          billItemsMap.set(item.productId, {
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            total: itemTotal,
          });
        }
      }
    }

    // Trả về cấu trúc hóa đơn chi tiết cho Frontend vẽ giao diện
    return {
      table: { id: table.id, name: table.name },
      items: Array.from(billItemsMap.values()),
      grandTotal: grandTotalPrice,
      orderCount: activeOrders.length, // Số lượt khách bấm gọi món
    };
  }

  async checkoutTable(tableId: string) {
    // 1. Tìm phiên ăn đang chạy
    const activeSession = await this.prismaService.diningSession.findFirst({
      where: { tableId: tableId, isClosed: false },
    });
    if (!activeSession) throw new BadRequestException('Không có phiên ăn nào để thanh toán');

    // Kiểm tra xem bàn có hóa đơn nào cần thanh toán không
    const bill = await this.getBillByTable(tableId);
    if (bill.orderCount === 0) {
      throw new BadRequestException('Bàn này hiện không có đơn hàng nào cần thanh toán');
    }

    const redisKey = `table_session:${tableId}`;

    await this.prismaService.$transaction(async (tx) => {
      // BƯỚC MỚI: Đóng phiên ăn
      await tx.diningSession.update({
        where: { id: activeSession.id },
        data: {
          isClosed: true,
          endTime: new Date(),
        },
      });

      // BƯỚC MỚI: Sinh ra Invoice (Hóa đơn lưu vĩnh viễn)
      await tx.invoice.create({
        data: {
          sessionId: activeSession.id,
          amount: bill.grandTotal,
          finalAmount: bill.grandTotal,
          status: InvoiceStatus.PAID,
          paymentMethod: PaymentMethod.CASH,
        },
      });

      // Đổi trạng thái Bàn về AVAILABLE
      await tx.table.update({
        where: { id: tableId },
        data: { status: TableStatus.AVAILABLE },
      });
    });

    // Bước C: Xóa sạch phiên ăn của khách trên Cloud Redis
    await this.cacheManager.del(redisKey);

    // Bước D: BẮN SOCKET REALTIME để thông báo cho toàn hệ thống
    // Toàn bộ iPad Sơ đồ bàn của Phục vụ sẽ lập tức chuyển bàn này sang màu Xanh Lá
    this.orderGateway.server.emit('onTableStatusChanged', {
      tableId,
      status: TableStatus.AVAILABLE,
    });

    return { message: 'Thanh toán thành công!' };
  }
}
