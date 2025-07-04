import { UsersService } from './../users/users.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/create-auth.dto';
import { Request, Response } from 'express';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly usersService:UsersService
  ) {}
  //SignUp
  @Post('log-up-user')
  @HttpCode(200)
  async logUp(
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.authService.singUpUser(createUserDto);
  }
  // Student login
  @Post('log-in-user')
  @HttpCode(200)
  async loginStudent(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signInUser(loginDto, res);
  }

  // Student logout
  @Post('sign-out-user')
  async signOutStudent(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logOutUser(req, res);
  }


  // Student refresh
  @Get('refresh-token-user')
  async refreshStudent(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshTokenUser(req, res);
  }

}
