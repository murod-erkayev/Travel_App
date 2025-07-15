import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiCookieAuth,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/create-auth.dto";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { Request, Response } from "express";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService
    // UsersService ni o'chirib tashlash - AuthService da bor
  ) {}

  @Post("log-up-user")
  @HttpCode(200)
  @ApiOperation({ summary: "Yangi foydalanuvchini ro'yxatdan o'tkazish" })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 200,
    description: "Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi",
  })
  async logUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.singUpUser(createUserDto);
  }

  @Post("log-in-user")
  @HttpCode(200)
  @ApiOperation({ summary: "Foydalanuvchini tizimga kirishi" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: "Login muvaffaqiyatli" })
  async loginStudent(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signInUser(loginDto, res);
  }

  @Post("log-out-user")
  @ApiOperation({ summary: "Tizimdan chiqish" })
  @ApiCookieAuth("refresh_token")
  @ApiResponse({ status: 200, description: "Log out muvaffaqiyatli" })
  async signOutStudent(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.logOutUser(req, res);
  }

  @Get("refresh-token-user")
  @ApiOperation({ summary: "Tokenni yangilash" })
  @ApiCookieAuth("refresh_token")
  @ApiResponse({ status: 200, description: "Token yangilandi" })
  async refreshStudent(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.refreshTokenUser(req, res);
  }

  @Post("send-otp")
  @ApiOperation({ summary: "Emailga OTP yuborish" })
  @ApiResponse({ status: 200, description: "OTP yuborildi" })
  sendOtp(@Body() createUserDto: CreateUserDto) {
    return this.authService.sendEmailOtp(createUserDto); // AuthService ishlatish
  }

  @Post("activate")
  @ApiOperation({
    summary: "OTP orqali foydalanuvchini yaratish va faollashtirish",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        otp: { type: "string", example: "123456" },
      },
      required: ["otp"],
    },
  })
  @ApiResponse({
    status: 200,
    description: "Foydalanuvchi muvaffaqiyatli faollashtirildi",
  })
  activate(
    @Body("otp") otp: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.activateUser(otp, res); // AuthService ishlatish
  }
}
