import { User } from "./../users/entities/user.entity";
import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
  UseGuards,
  Patch,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiCookieAuth,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/create-auth.dto";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../common/guards/user.guard";
import { UpdateUserDto } from "../users/dto/update-user.dto";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService
    // UsersService ni o'chirib tashlash - AuthService da bor
  ) {}

  // @Post("log-up-user")
  // @HttpCode(200)
  // @ApiOperation({ summary: "Yangi foydalanuvchini ro'yxatdan o'tkazish" })
  // @ApiBody({ type: CreateUserDto })
  // @ApiResponse({
  //   status: 200,
  //   description: "Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi",
  // })
  // async logUp(@Body() createUserDto: CreateUserDto) {
  //   return this.authService.singUpUser(createUserDto);
  // }

  // @Post("log-in-user")
  // @HttpCode(200)
  // @ApiOperation({ summary: "Foydalanuvchini tizimga kirishi" })
  // @ApiBody({ type: LoginDto })
  // @ApiResponse({ status: 200, description: "Login muvaffaqiyatli" })
  // async loginStudent(
  //   @Body() loginDto: LoginDto,
  //   @Res({ passthrough: true }) res: Response
  // ) {
  //   return this.authService.signInUser(loginDto, res);
  // }

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
  //Send Opt
  @Post("send-otp")
  @ApiOperation({ summary: "Emailga OTP yuborish" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: { type: "string", example: "murodjonerkayev18@gmail.com" },
      },
      required: ["email"],
    },
  })
  @ApiResponse({ status: 200, description: "OTP yuborildi" })
  sendOtp(@Body() body: { email: string }) {
    return this.authService.sendOtp(body.email); // Faqat email yuborish
  }

  @Post("verify-otp")
  @ApiOperation({
    summary: "OTP ni tasdiqlash va token olish (SignUp/SignIn)",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: { type: "string", example: "user@example.com" },
        otp: { type: "string", example: "123456" },
      },
      required: ["email", "otp"],
    },
  })
  @ApiResponse({
    status: 200,
    description: "Muvaffaqiyatli tasdiqlandi va token berildi",
  })
  verifyOtp(
    @Body()
    body: {
      email: string;
      otp: string;
    },
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.verifyOtp(body.email, body.otp, res);
  }
  @Post("check-register")
  @ApiOperation({ summary: "Foydalanuvchi ro'yxatdan o'tganligini tekshirish" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: { type: "string", example: "murodjonerkayev18@gmail.com" },
      },
      required: ["email"],
    },
  })
  @ApiResponse({
    status: 200,
    description: "Foydalanuvchi ro'yxatdan o'tgan",
    schema: {
      example: {
        isregister: true,
        message: "Foydalanuvchi ro'yxatdan o'tgan",
      },
    },
  })
  @ApiResponse({
    status: 422,
    description: "Foydalanuvchi ro'yxatdan o'tmagan",
    schema: {
      example: {
        isregister: false,
        message: "Siz hali ro'yxatdan o'tmagansiz",
      },
    },
  })
  async checkRegister(@Body() body: { email: string }) {
    return this.authService.checkRegister(body.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile-get")
  @ApiOperation({ summary: "User profile ma'lumotlari" })
  @ApiBearerAuth()
  async getProfile(@Req() req: any) {
    const { id } = req.user;
    return this.authService.getProfile(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("profile-update")
  @ApiOperation({ summary: "User profile yangilash" })
  @ApiBody({ type: UpdateUserDto })
  @ApiBearerAuth()
  async editProfile(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.id;
    return this.authService.editProfile(userId, updateUserDto);
  }
}
