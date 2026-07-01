import { OrderWithDetails } from 'src/modules/orders/types/order.type';
import { OrderResponseDto } from '../dtos/response/order.response.dto';

export class OrderMapper {
  static toResponse(order: OrderWithDetails): OrderResponseDto {
    return {
      id: order.id,
      sessionId: order.sessionId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      status: order.status,
      totalPrice: Number(order.totalPrice),
      orderItems: order.orderItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        note: item.note,
        productId: item.productId,
        productName: item.product.name,
      })),
    };
  }
}
