import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderRequestDto } from 'src/modules/orders/dtos/request/create-order.request.dto';
import { OrderResponseDto } from 'src/modules/orders/dtos/response/order.response.dto';
import { OrderMapper } from 'src/modules/orders/mappers/order.mapper';
import { OrderGateway } from 'src/modules/orders/order.gateway';
import { UpdateOrderStatusRequestDto } from 'src/modules/orders/dtos/request/update-order-status.request.dto';

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
    const redisKey = `table_session:${data.tableId}`;
    const isTableOpen = await this.cacheManager.get<boolean>(redisKey);

    if (!isTableOpen) {
      throw new ForbiddenException('Bàn chưa được mở hoặc đã hết thời gian sử dụng.');
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
        tableId: data.tableId,
        totalPrice: calculatedTotalPrice,
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
        table: true, // Lấy tên Bàn ra (VD: "Bàn 01")
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
        table: true,
        orderItems: {
          include: { product: true },
        },
      },
    });

    this.orderGateway.server.emit('onOrderStatusChanged', updatedOrder);

    return OrderMapper.toResponse(updatedOrder);
  }
}
