import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from "@nestjs/swagger";
import { LocationsService } from "./locations.service";
import { CreateLocationDto } from "./dto/create-location.dto";
import { UpdateLocationDto } from "./dto/update-location.dto";

@ApiTags("Locations")
@Controller("locations")
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: "Yangi location yaratish" })
  @ApiBody({ type: CreateLocationDto })
  @ApiResponse({
    status: 201,
    description: "Location muvaffaqiyatli yaratildi",
    example: {
      id: 1,
      name: "Cappadocia Air Balloon",
      description: "Amazing hot air balloon experience",
      full_description: "Experience the breathtaking views...",
      city: "Goreme",
      country: "Turkey",
      latitude: "38.643345",
      longtitude: "34.831472",
      main_img: "https://example.com/cappadocia-balloon.jpg",
      base_price: "200.00",
      category_id: 1,
      is_active: "true",
      category: {
        id: 1,
        name: "Adventure",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Noto'g'ri ma'lumotlar yoki category topilmadi",
  })
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationsService.create(createLocationDto);
  }

  @Get()
  @ApiOperation({ summary: "Barcha locationlarni olish" })
  @ApiResponse({
    status: 200,
    description: "Locationlar ro'yxati muvaffaqiyatli qaytarildi",
    example: [
      {
        id: 1,
        name: "Cappadocia Air Balloon",
        description: "Amazing hot air balloon experience",
        city: "Goreme",
        country: "Turkey",
        base_price: "200.00",
        is_active: "true",
        category: {
          id: 1,
          name: "Adventure",
          description: "Adventurous activities",
        },
      },
    ],
  })
  findAll() {
    return this.locationsService.findAll();
  }

  // @Get("active")
  // @ApiOperation({ summary: "Faol locationlarni olish" })
  // @ApiResponse({
  //   status: 200,
  //   description: "Faol locationlar ro'yxati",
  // })
  // findActive() {
  //   return this.locationsService.findActive();
  // }

  // @Get("search/:term")
  // @ApiOperation({ summary: "Location qidirish" })
  // @ApiParam({
  //   name: "term",
  //   description: "Qidiruv matni",
  //   example: "balloon",
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: "Qidiruv natijalari",
  // })
  // search(@Param("term") searchTerm: string) {
  //   return this.locationsService.search(searchTerm);
  // }

  // @Get("category/:categoryId")
  // @ApiOperation({ summary: "Category bo'yicha locationlarni olish" })
  // @ApiParam({
  //   name: "categoryId",
  //   description: "Category ID raqami",
  //   example: 1,
  //   type: "number",
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: "Category bo'yicha locationlar",
  // })
  // @ApiResponse({ status: 404, description: "Category topilmadi" })
  // findByCategory(@Param("categoryId", ParseIntPipe) categoryId: number) {
  //   return this.locationsService.findByCategory(categoryId);
  // }

  @Get(":id")
  @ApiOperation({ summary: "ID bo'yicha locationni olish" })
  @ApiParam({
    name: "id",
    description: "Location ID raqami",
    example: 1,
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "Location topildi",
    example: {
      id: 1,
      name: "Cappadocia Air Balloon",
      description: "Amazing hot air balloon experience",
      full_description: "Experience the breathtaking views...",
      city: "Goreme",
      country: "Turkey",
      latitude: "38.643345",
      longtitude: "34.831472",
      main_img: "https://example.com/cappadocia-balloon.jpg",
      base_price: "200.00",
      category_id: 1,
      is_active: "true",
      category: {
        id: 1,
        name: "Adventure",
        description: "Adventurous activities",
      },
    },
  })
  @ApiResponse({ status: 404, description: "Location topilmadi" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.locationsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Locationni yangilash" })
  @ApiParam({
    name: "id",
    description: "Location ID raqami",
    example: 1,
    type: "number",
  })
  @ApiBody({ type: UpdateLocationDto })
  @ApiResponse({
    status: 200,
    description: "Location muvaffaqiyatli yangilandi",
  })
  @ApiResponse({ status: 404, description: "Location topilmadi" })
  @ApiResponse({ status: 400, description: "Noto'g'ri ma'lumotlar" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateLocationDto: UpdateLocationDto
  ) {
    return this.locationsService.update(id, updateLocationDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Locationni o'chirish" })
  @ApiParam({
    name: "id",
    description: "Location ID raqami",
    example: 1,
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "Location muvaffaqiyatli o'chirildi",
    example: {
      message: "Location deleted successfully",
    },
  })
  @ApiResponse({ status: 404, description: "Location topilmadi" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.locationsService.remove(id);
  }
}
