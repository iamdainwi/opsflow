import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { LoginUserDto, RegisterUserDto } from './dto/auth.dto.js';
import { PasswordHasher } from '@nestjs/authentication';
@Injectable()
export class AuthService {
  constructor(
    private readonly userServices: UsersService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async create(registerUserDto: RegisterUserDto) {
    const hashedPassword = await this.passwordHasher.hash(
      registerUserDto.password,
    );
    return await this.userServices.create({
      ...registerUserDto,
      password: hashedPassword,
    });
  }

  async verify(loginUserDto: LoginUserDto) {
    const found = await this.userServices.findOneByEmail(loginUserDto.email);

    if (!found) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await this.passwordHasher.verify(
      loginUserDto.password,
      found.password,
    );

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
    };
  }
}
