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
import { CreateSearchHistoryDto } from "./dto/create-search_history.dto";
import { UpdateSearchHistoryDto } from "./dto/update-search_history.dto";
import { SearchHistoryService } from "./search_history.service";

@ApiTags("Search History")
@Controller("search-history")
export class SearchHistoryController {
  constructor(private readonly searchHistoryService: SearchHistoryService) {}

  @Post()
  @ApiOperation({ summary: "Yangi qidiruv tarixini yaratish" })
  @ApiBody({ type: CreateSearchHistoryDto })
  @ApiResponse({
    status: 201,
    description: "Qidiruv tarixi muvaffaqiyatli yaratildi",
    example: {
      id: 1,
      user_id: 1,
      search_query: "Cappadocia balloon",
      search_type: "location",
      filters: null,
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
  create(@Body() createSearchHistoryDto: CreateSearchHistoryDto) {
    return this.searchHistoryService.create(createSearchHistoryDto);
  }

  @Get()
  @ApiOperation({ summary: "Barcha qidiruv tarixini olish" })
  @ApiResponse({
    status: 200,
    description: "Qidiruv tarixi ro'yxati muvaffaqiyatli qaytarildi",
    example: [
      {
        id: 1,
        user_id: 1,
        search_query: "Cappadocia balloon",
        search_type: "location",
        filters: null,
        created_at: "2024-07-15T10:30:00Z",
        user: {
          id: 1,
          full_name: "John Doe",
        },
      },
    ],
  })
  findAll() {
    return this.searchHistoryService.findAll();
  }

  // @Get("user/:userId")
  // @ApiOperation({ summary: "Foydalanuvchi bo'yicha qidiruv tarixini olish" })
  // @ApiParam({
  //   name: "userId",
  //   description: "Foydalanuvchi ID raqami",
  //   example: 1,
  //   type: "number",
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: "Foydalanuvchi qidiruv tarixi",
  // })
  // findByUserId(@Param("userId", ParseIntPipe) userId: number) {
  //   return this.searchHistoryService.findByUserId(userId);
  // }

  // @Get("popular")
  // @ApiOperation({ summary: "Mashhur qidiruv so'zlarini olish" })
  // @ApiResponse({
  //   status: 200,
  //   description: "Mashhur qidiruv so'zlari",
  //   example: [
  //     { search_query: "Cappadocia", count: 15 },
  //     { search_query: "Istanbul", count: 12 },
  //     { search_query: "Pamukkale", count: 8 },
  //   ],
  // })
  // getPopularSearches() {
  //   return this.searchHistoryService.getPopularSearches();
  // }

  @Get(":id")
  @ApiOperation({ summary: "ID bo'yicha qidiruv tarixini olish" })
  @ApiParam({
    name: "id",
    description: "Qidiruv tarixi ID raqami",
    example: 1,
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "Qidiruv tarixi topildi",
    example: {
      id: 1,
      user_id: 1,
      search_query: "Cappadocia balloon",
      search_type: "location",
      filters: '{"price_range": "100-500"}',
      created_at: "2024-07-15T10:30:00Z",
      user: {
        id: 1,
        full_name: "John Doe",
        email: "john@example.com",
      },
    },
  })
  @ApiResponse({ status: 404, description: "Qidiruv tarixi topilmadi" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.searchHistoryService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Qidiruv tarixini yangilash" })
  @ApiParam({
    name: "id",
    description: "Qidiruv tarixi ID raqami",
    example: 1,
    type: "number",
  })
  @ApiBody({ type: UpdateSearchHistoryDto })
  @ApiResponse({
    status: 200,
    description: "Qidiruv tarixi muvaffaqiyatli yangilandi",
  })
  @ApiResponse({ status: 404, description: "Qidiruv tarixi topilmadi" })
  @ApiResponse({ status: 400, description: "Noto'g'ri ma'lumotlar" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateSearchHistoryDto: UpdateSearchHistoryDto
  ) {
    return this.searchHistoryService.update(id, updateSearchHistoryDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Qidiruv tarixini o'chirish" })
  @ApiParam({
    name: "id",
    description: "Qidiruv tarixi ID raqami",
    example: 1,
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "Qidiruv tarixi muvaffaqiyatli o'chirildi",
  })
  @ApiResponse({ status: 404, description: "Qidiruv tarixi topilmadi" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.searchHistoryService.remove(id);
  }

  // @Delete("user/:userId")
  // @ApiOperation({
  //   summary: "Foydalanuvchining barcha qidiruv tarixini o'chirish",
  // })
  // @ApiParam({
  //   name: "userId",
  //   description: "Foydalanuvchi ID raqami",
  //   example: 1,
  //   type: "number",
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: "Foydalanuvchi qidiruv tarixi o'chirildi",
  // })
  // removeByUserId(@Param("userId", ParseIntPipe) userId: number) {
  //   return this.searchHistoryService.removeByUserId(userId);
  // }
}
