import { ApiResponseProperty } from '@nestjs/swagger';
import { UserInfoResponseDto } from 'src/modules/users/dtos/response/user-info.response.dto';

export class LoginResponseDto {
  @ApiResponseProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiResponseProperty({
    type: UserInfoResponseDto,
  })
  user: UserInfoResponseDto;
}
