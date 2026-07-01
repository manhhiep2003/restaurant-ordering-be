import { Prisma } from '@prisma/client';

export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    orderItems: {
      include: {
        product: true;
      };
    };
  };
}>;
