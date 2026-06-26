import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
import { LoginRequestDto } from 'src/modules/auth/dtos/login.request.dto';
import { RegisterRequestDto } from 'src/modules/auth/dtos/register.request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginRequestDto) {
    const result = await this.authService.login(body);

    return {
      status: 'OK',
      message: 'Login successfully',
      result,
    };
  }

  @Post('register')
  async register(@Body() body: RegisterRequestDto) {
    const result = await this.authService.register(body);

    return {
      status: 'OK',
      message: 'Register successfully',
      result,
    };
  }
}
