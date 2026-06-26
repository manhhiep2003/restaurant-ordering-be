import { RegisterRequestDto } from './dtos/register.request.dto';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginRequestDto } from 'src/modules/auth/dtos/login.request.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginRequestDto: LoginRequestDto): Promise<any> {
    const { username, password } = loginRequestDto;

    const user = await this.prismaService.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    const validatePassword = await bcrypt.compare(password, user.passwordHash);

    if (!validatePassword) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    return {
      token: this.jwtService.sign({ username }),
    };
  }

  async register(registerRequestDto: RegisterRequestDto) {
    const { username, password, fullName } = registerRequestDto;

    const existedUser = await this.prismaService.user.findUnique({
      where: { username },
    });

    if (existedUser) {
      throw new ConflictException('Username already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prismaService.user.create({
      data: {
        username,
        passwordHash,
        fullName,
      },
    });

    return {
      token: this.jwtService.sign({
        sub: user.id,
        username: user.username,
      }),
    };
  }
}
