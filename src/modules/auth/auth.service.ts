import { RegisterRequestDto } from './dtos/request/register.request.dto';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginRequestDto } from 'src/modules/auth/dtos/request/login.request.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { LoginResponseDto } from 'src/modules/auth/dtos/response/login.response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginRequestDto: LoginRequestDto): Promise<LoginResponseDto> {
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

    const token = this.jwtService.sign({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
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
        role: Role.STAFF,
      },
    });

    return {
      token: this.jwtService.sign({
        sub: user.id,
        username: user.username,
        role: user.role,
      }),
    };
  }
}
