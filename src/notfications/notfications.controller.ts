import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
import { NotficationsService } from "./notfications.service";
import { CreateNotficationDto } from "./dto/create-notfication.dto";
import { UpdateNotficationDto } from "./dto/update-notfication.dto";

@ApiTags("Notfications")
@Controller("notifications") // notfications -> notifications
export class NotficationsController {
  constructor(private readonly notificationsService: NotficationsService) {}

  @Post()
  @ApiOperation({ summary: "Yangi bildirishnoma yaratish" })
  @ApiBody({ type: CreateNotficationDto })
  @ApiResponse({
    status: 201,
    description: "Bildirishnoma muvaffaqiyatli yaratildi",
    example: {
      id: 1,
      user_id: 1,
      title: "Yangi xabar",
      message: "Sizga yangi xabar keldi",
      notification_type: "info",
      is_read: false,
      created_at: "2024-07-15T10:30:00Z",
      user: {
        id: 1,
        full_name: "John Doe",
        email: "john@example.com",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Noto'g'ri ma'lumotlar yoki user topilmadi",
  })
  create(@Body() createNotificationDto: CreateNotficationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: "Barcha bildirishnomalarni olish" })
  @ApiResponse({
    status: 200,
    description: "Bildirishnomalar ro'yxati muvaffaqiyatli qaytarildi",
    example: [
      {
        id: 1,
        user_id: 1,
        title: "Yangi xabar",
        message: "Sizga yangi xabar keldi",
        notification_type: "info",
        is_read: false,
        created_at: "2024-07-15T10:30:00Z",
        user: {
          id: 1,
          full_name: "John Doe",
        },
      },
    ],
  })
  findAll() {
    return this.notificationsService.findAll();
  }

  // @Get("user/:userId")
  // @ApiOperation({ summary: "Foydalanuvchi bo'yicha bildirishnomalarni olish" })
  // @ApiParam({
  //   name: "userId",
  //   description: "Foydalanuvchi ID raqami",
  //   example: 1,
  //   type: "number",
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: "Foydalanuvchi bildirishnomalari",
  // })
  // findByUserId(@Param("userId", ParseIntPipe) userId: number) {
  //   return this.notificationsService.findByUserId(userId);
  // }

  @Get(":id")
  @ApiOperation({ summary: "ID bo'yicha bildirishnomani olish" })
  @ApiParam({
    name: "id",
    description: "Bildirishnoma ID raqami",
    example: 1,
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "Bildirishnoma topildi",
    example: {
      id: 1,
      user_id: 1,
      title: "Yangi xabar",
      message: "Sizga yangi xabar keldi",
      notification_type: "info",
      is_read: false,
      created_at: "2024-07-15T10:30:00Z",
      user: {
        id: 1,
        full_name: "John Doe",
        email: "john@example.com",
      },
    },
  })
  @ApiResponse({ status: 404, description: "Bildirishnoma topilmadi" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.notificationsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Bildirishnomani yangilash" })
  @ApiParam({
    name: "id",
    description: "Bildirishnoma ID raqami",
    example: 1,
    type: "number",
  })
  @ApiBody({ type: UpdateNotficationDto })
  @ApiResponse({
    status: 200,
    description: "Bildirishnoma muvaffaqiyatli yangilandi",
  })
  @ApiResponse({ status: 404, description: "Bildirishnoma topilmadi" })
  @ApiResponse({ status: 400, description: "Noto'g'ri ma'lumotlar" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateNotificationDto: UpdateNotficationDto
  ) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Bildirishnomani o'qilgan deb belgilash" })
  @ApiParam({
    name: "id",
    description: "Bildirishnoma ID raqami",
    example: 1,
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "Bildirishnoma o'qilgan deb belgilandi",
  })
  markAsRead(@Param("id", ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(id);
  }

  // @Patch("user/:userId/read-all")
  // @ApiOperation({
  //   summary:
  //     "Foydalanuvchining barcha bildirishnomalarini o'qilgan deb belgilash",
  // })
  // @ApiParam({
  //   name: "userId",
  //   description: "Foydalanuvchi ID raqami",
  //   example: 1,
  //   type: "number",
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: "Barcha bildirishnomalar o'qilgan deb belgilandi",
  // })
  // markAllAsRead(@Param("userId", ParseIntPipe) userId: number) {
  //   return this.notificationsService.markAllAsRead(userId);
  // }

  @Delete(":id")
  @ApiOperation({ summary: "Bildirishnomani o'chirish" })
  @ApiParam({
    name: "id",
    description: "Bildirishnoma ID raqami",
    example: 1,
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "Bildirishnoma muvaffaqiyatli o'chirildi",
  })
  @ApiResponse({ status: 404, description: "Bildirishnoma topilmadi" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.notificationsService.remove(id);
  }
}
