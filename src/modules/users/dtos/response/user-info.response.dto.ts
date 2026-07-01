import { ApiResponseProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';

export class UserInfoResponseDto extends BaseResponseDto {
  @ApiResponseProperty({
    example: 'staff',
  })
  username: string;

  @ApiResponseProperty({
    example: 'Nguyễn Văn A',
  })
  fullName: string;

  @ApiResponseProperty({
    enum: Role,
    example: Role.STAFF,
  })
  role: Role;
}
