import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
  Req,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import {
  ApiBody,
  ApiExcludeController,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { PassThrough } from "stream";
import { Response } from "express";
import { JwtAuthGuard } from "../common/guards/user.guard";
@ApiExcludeController()
// @ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  // @ApiOperation({
  //   summary: "Admin tomonidan darhol foydalanuvchi yaratish (OTP yo‘q)",
  // })
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
}
