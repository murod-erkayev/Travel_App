import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/create-auth.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Request, Response } from 'express';

@ApiTags('Authentication') // Swagger'da grouping uchun
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('log-up-user')
  @HttpCode(200)
  @ApiOperation({ summary: 'Yangi foydalanuvchini ro‘yxatdan o‘tkazish' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 200, description: 'Foydalanuvchi muvaffaqiyatli ro‘yxatdan o‘tdi' })
  async logUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.singUpUser(createUserDto);
  }

  @Post('log-in-user')
  @HttpCode(200)
  @ApiOperation({ summary: 'Foydalanuvchini tizimga kirishi' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login muvaffaqiyatli' })
  async loginStudent(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signInUser(loginDto, res);
  }

  @Post('log-out-user')
  @ApiOperation({ summary: 'Tizimdan chiqish' })
  @ApiCookieAuth('refresh_token')
  @ApiResponse({ status: 200, description: 'Log out muvaffaqiyatli' })
  async signOutStudent(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logOutUser(req, res);
  }

  @Get('refresh-token-user')
  @ApiOperation({ summary: 'Tokenni yangilash' })
  @ApiCookieAuth('refresh_token')
  @ApiResponse({ status: 200, description: 'Token yangilandi' })
  async refreshStudent(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshTokenUser(req, res);
  }
}
