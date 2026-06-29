import { Prisma } from '@prisma/client';

export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    table: true;
    orderItems: {
      include: {
        product: true;
      };
    };
  };
}>;
