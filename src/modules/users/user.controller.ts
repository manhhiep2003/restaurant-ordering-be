import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { QueryPaginationDto } from 'src/common/dtos/query-pagination.dto';
import { PaginateOutput } from 'src/common/utils/pagination.util';
import { User } from '@prisma/client';

@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  //@UseGuards(JwtAuthGuard)
  async getAllUsers(@Query() query?: QueryPaginationDto): Promise<PaginateOutput<User>> {
    return this.userService.getAllUsers(query);
  }
}
