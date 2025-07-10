import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("Foydalanuvchilar")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("send-otp")
  @ApiOperation({ summary: "Emailga OTP yuborish" })
  @ApiResponse({ status: 200, description: "OTP yuborildi" })
  sendOtp(@Body() createUserDto: CreateUserDto) {
    return this.usersService.sendEmailOtp(createUserDto);
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
  activate(@Body("otp") otp: string) {
    return this.usersService.activateUser(otp);
  }

  @Post()
  @ApiOperation({
    summary: "Admin tomonidan darhol foydalanuvchi yaratish (OTP yo‘q)",
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: "Barcha foydalanuvchilar ro‘yxatini olish" })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Bitta foydalanuvchini olish" })
  @ApiParam({ name: "id", required: true, example: 1 })
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Foydalanuvchini tahrirlash" })
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Foydalanuvchini o‘chirish" })
  remove(@Param("id") id: string) {
    return this.usersService.remove(+id);
  }

  //Reset Possword
  @Post("reset-password/send-otp")
  @ApiOperation({ summary: "Parolni tiklash uchun OTP yuborish" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: { type: "string", example: "user@example.com" },
      },
      required: ["email"],
    },
  })
  sendOtpForReset(@Body("email") email: string) {
    return this.usersService.sendOtpForResetPassword(email);
  }

  @Post("reset-password/verify-otp")
  @ApiOperation({ summary: "Reset password uchun OTP ni tekshirish" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        otp: { type: "string", example: "123456" },
      },
      required: ["otp"],
    },
  })
  verifyResetOtp(@Body("otp") otp: string) {
    return this.usersService.verifyResetOtp(otp);
  }

  @Post("reset-password")
  @ApiOperation({ summary: "Yangi parolni saqlash" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: { type: "string", example: "user@example.com" },
        password: { type: "string", example: "newPassword123" },
        confirm_password: { type: "string", example: "newPassword123" },
      },
      required: ["email", "password", "confirm_password"],
    },
  })
  resetPassword(
    @Body("email") email: string,
    @Body("password") password: string,
    @Body("confirm_password") confirm_password: string
  ) {
    return this.usersService.resetPassword(email, password, confirm_password);
  }

  @Post("change-password")
  @ApiOperation({ summary: "Parolni yangilash" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        userId: { type: "number", example: 40 },
        old_password: { type: "string", example: "Murod1972!" },
        new_password: { type: "string", example: "Oybek1202!" },
        confirm_password: { type: "string", example: "Oybek1202!" },
      },
      required: ["userId", "old_password", "new_password", "confirm_password"],
    },
  })
  changePassword(@Body() body: any) {
    const { userId, new_password, confirm_password, old_password } = body;
    return this.usersService.changePassword(
      userId,
      new_password,
      confirm_password,
      old_password
    );
  }
}
