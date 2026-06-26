import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { QueryPaginationDto } from 'src/common/dtos/query-pagination.dto';
import { paginate, paginateOutput, PaginateOutput } from 'src/common/utils/pagination.util';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // async getAllUsers(): Promise<User[]> {
  //   return await this.prisma.user.findMany();
  // }

  async getAllUsers(query: QueryPaginationDto = {}): Promise<PaginateOutput<User>> {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        ...paginate(query),
      }),
      this.prisma.user.count(),
    ]);

    return paginateOutput<User>(users, total, query);
  }
}
