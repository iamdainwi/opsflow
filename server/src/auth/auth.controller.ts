import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginUserDto, RegisterUserDto } from './dto/auth.dto.js';
import { Public } from '@nestjs/authentication';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @Public()
  create(@Body() createAuthDto: RegisterUserDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('/login')
  @Public()
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.authService.verify(loginUserDto);
  }
}
