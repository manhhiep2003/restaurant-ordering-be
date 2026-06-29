import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
import { LoginRequestDto } from 'src/modules/auth/dtos/request/login.request.dto';
import { LoginResponseDto } from 'src/modules/auth/dtos/response/login.response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(body);
  }

  // @Post('register')
  // async register(@Body() body: RegisterRequestDto) {
  //   const result = await this.authService.register(body);

  //   return {
  //     status: 'OK',
  //     message: 'Register successfully',
  //     result,
  //   };
  // }
}
