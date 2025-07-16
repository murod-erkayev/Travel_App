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
import { Request, Response } from "express";
import { JwtAuthGuard } from "../common/guards/user.guard";
import { UpdateUserDto } from "../users/dto/update-user.dto";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("log-out-user")
  @ApiOperation({ summary: "Tizimdan chiqish" })
  @ApiCookieAuth("refresh_token")
  @ApiResponse({
    status: 200,
    description: "Log out muvaffaqiyatli",
    schema: {
      example: {
        message: "Tizimdan muvaffaqiyatli chiqildi",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Refresh token yo'q yoki noto'g'ri",
    schema: {
      example: {
        statusCode: 401,
        message: "Refresh token topilmadi",
      },
    },
  })
  async signOutStudent(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.logOutUser(req, res);
  }

  @Get("refresh-token-user")
  @ApiOperation({ summary: "Access token'ni yangilash" })
  @ApiCookieAuth("refresh_token")
  @ApiResponse({
    status: 200,
    description: "Token muvaffaqiyatli yangilandi",
    schema: {
      example: {
        message: "Token yangilandi",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Refresh token yo'q yoki muddati tugagan",
    schema: {
      example: {
        statusCode: 401,
        message: "Refresh token noto'g'ri",
      },
    },
  })
  async refreshStudent(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.refreshTokenUser(req, res);
  }

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
  @ApiResponse({
    status: 201,
    description: "OTP muvaffaqiyatli yuborildi",
    schema: {
      example: {
        message: "OTP murodjonerkayev18@gmail.com ga yuborildi.",
        otp: "123456",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Email noto'g'ri yoki OTP yuborishda xatolik",
    schema: {
      example: {
        statusCode: 400,
        message: "OTP yuborilmadi.",
      },
    },
  })
  sendOtp(@Body() body: { email: string }) {
    return this.authService.sendOtp(body.email);
  }

  @Post("verify-otp")
  @ApiOperation({ summary: "OTP ni tasdiqlash va token olish (SignUp/SignIn)" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: { type: "string", example: "murodjonerkayev18@gmail.com" },
        otp: { type: "string", example: "123456" },
      },
      required: ["email", "otp"],
    },
  })
  @ApiResponse({
    status: 201,
    description: "OTP tasdiqlandi va token berildi",
    schema: {
      example: {
        message: "Muvaffaqiyatli!",
        user: {
          id: 1,
          email: "murodjonerkayev18@gmail.com",
          full_name: "User",
          is_active: true,
        },
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "OTP noto'g'ri yoki muddati tugagan",
    schema: {
      example: {
        statusCode: 400,
        message: "Email yoki OTP noto'g'ri.",
      },
    },
  })
  verifyOtp(
    @Body() body: { email: string; otp: string },
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.verifyOtp(body.email, body.otp, res);
  }




  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
    status: 201,
    description: "Foydalanuvchi ro'yxatdan o'tgan",
    schema: {
      example: {
        isregister: true,
        message: "Foydalanuvchi allaqachon ro'yxatdan o'tgan.",
      },
    },
  })
  @ApiResponse({
    status: 422,
    description: "Foydalanuvchi ro'yxatdan o'tmagan",
    schema: {
      example: {
        isregister: false,
        message: "Siz hali ro'yxatdan o'tmagansiz. Iltimos, ro'yxatdan o'ting.",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Tekshirishda xatolik",
    schema: {
      example: {
        statusCode: 400,
        message: "Tekshirishda xatolik yuz berdi.",
      },
    },
  })
  async checkRegister(@Body() body: { email: string }) {
    return this.authService.checkRegister(body.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile-get")
  @ApiOperation({ summary: "User profile ma'lumotlarini olish" })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Profile ma'lumotlari muvaffaqiyatli olindi",
    schema: {
      example: {
        id: 1,
        full_name: "John Doe",
        email: "john@example.com",
        phone_number: "+998901234567",
        country: "Uzbekistan",
        city: "Tashkent",
        zip: "100000",
        address: "Chilonzor tumani",
        img_url: "https://example.com/avatar.jpg",
        googleId: null,
        is_active: true,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Token yo'q yoki noto'g'ri",
    schema: {
      example: {
        statusCode: 401,
        message: "Unauthorized",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Foydalanuvchi topilmadi",
    schema: {
      example: {
        statusCode: 400,
        message: "Bunday user mavjud emas",
      },
    },
  })
  async getProfile(@Req() req: any) {
    const { id } = req.user;
    return this.authService.getProfile(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("profile-update")
  @ApiOperation({ summary: "User profile ma'lumotlarini yangilash" })
  @ApiBody({ type: UpdateUserDto })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "Profile muvaffaqiyatli yangilandi",
    schema: {
      example: {
        message: "Profile muvaffaqiyatli yangilandi",
        user: {
          id: 1,
          full_name: "Updated Name",
          email: "updated@example.com",
          phone_number: "+998123456789",
          country: "Uzbekistan",
          city: "Tashkent",
          zip: "100000",
          address: "Yangi manzil",
          img_url: "https://example.com/new-avatar.jpg",
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Token yo'q yoki noto'g'ri",
    schema: {
      example: {
        statusCode: 401,
        message: "Unauthorized",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Foydalanuvchi topilmadi",
    schema: {
      example: {
        statusCode: 404,
        message: "ID: 1 bo'yicha foydalanuvchi topilmadi.",
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: "Email yoki telefon raqam allaqachon mavjud",
    schema: {
      example: {
        statusCode: 409,
        message: "Bunday emailga ega foydalanuvchi allaqachon mavjud.",
      },
    },
  })
  async editProfile(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.id;
    return this.authService.editProfile(userId, updateUserDto);
  }
}
