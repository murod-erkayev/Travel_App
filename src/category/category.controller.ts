import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  ParseIntPipe,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags("Categories")
@Controller("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // 1. POST - Yangi kategoriya yaratish
  @Post()
  @ApiOperation({ summary: "Yangi kategoriya yaratish" })
  @ApiResponse({
    status: 201,
    description: "Kategoriya muvaffaqiyatli yaratildi",
    example: {
      id: 1,
      name: "Manzillar",
      description: "Sayohat joylari",
      category_img_url: "places.png",
      parent_id: null,
    },
  })
  @ApiResponse({
    status: 400,
    description: "Noto'g'ri ma'lumotlar yoki parent topilmadi",
  })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoryService.create(createCategoryDto);
  }

  // 2. GET - Barcha kategoriyalar
  @Get()
  @ApiOperation({ summary: "Barcha kategoriyalarni olish" })
  @ApiResponse({
    status: 200,
    description: "Kategoriyalar ro'yxati",
    example: [
      {
        id: 1,
        name: "Manzillar",
        parent_id: null,
        children: [],
      },
    ],
  })
  async findAll() {
    return await this.categoryService.findAll();
  }
  // 3. GET - Parent kategoriyalarni olish (ASOSIY API)
  @Get("parents")
  @ApiOperation({ summary: "Asosiy kategoriyalarni olish" })
  @ApiResponse({
    status: 200,
    description: "Parent kategoriyalar ro'yxati",
    example: [
      {
        id: 1,
        name: "Manzillar",
        description: "Sayohat joylari",
        category_img_url: "places.png",
        parent_id: null,
        children: [
          {
            id: 3,
            name: "Cappadocia",
            parent_id: 1,
          },
        ],
      },
    ],
  })
  async findParentCategories() {
    return await this.categoryService.findParentCategories();
  }

  
  // 4. GET - Bitta kategoriyani olish
  @Get(":id")
  @ApiOperation({ summary: "ID bo'yicha kategoriyani olish" })
  @ApiParam({ name: "id", description: "Kategoriya ID raqami", example: 1 })
  @ApiResponse({
    status: 200,
    description: "Kategoriya ma'lumotlari",
    example: {
      id: 1,
      name: "Manzillar",
      description: "Sayohat joylari",
      parent_id: null,
      children: [],
      parent: null,
    },
  })
  @ApiResponse({ status: 404, description: "Kategoriya topilmadi" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return await this.categoryService.findOne(id);
  }

  // 5. GET - Kategoriyaning bolalarini olish (ASOSIY API)
  @Get(":id/children")
  @ApiOperation({ summary: "Kategoriyaning bolalarini olish" })
  @ApiParam({
    name: "id",
    description: "Parent kategoriya ID raqami",
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Child kategoriyalar ro'yxati",
    example: [
      {
        id: 3,
        name: "Cappadocia Air Balloon",
        description: "Havo sharlari",
        category_img_url: "cappadocia.jpg",
        parent_id: 1,
        children: [],
      },
      {
        id: 4,
        name: "Switzerland",
        description: "Tog\'lar va ko\'llar",
        parent_id: 1,
        children: [],
      },
    ],
  })
  @ApiResponse({ status: 404, description: "Parent kategoriya topilmadi" })
  async findChildrenByParentId(@Param("id", ParseIntPipe) id: number) {
    return await this.categoryService.findChildrenByParentId(id);
  }

  // 6. GET - Kategoriyaning mahsulotlarini olish (ASOSIY API)
  @Get(":id/products")
  @ApiOperation({ summary: "Kategoriyaning mahsulotlarini olish" })
  @ApiParam({ name: "id", description: "Kategoriya ID raqami", example: 3 })
  @ApiResponse({
    status: 200,
    description: "Kategoriya mahsulotlari ro'yxati",
    example: {
      id: 3,
      name: "Cappadocia Air Balloon",
      products: [
        {
          id: 101,
          name: "Cappadocia Balloon Tour",
          price: 500,
          description: "Havo sharida sayohat",
          category_id: 3,
        },
        {
          id: 102,
          name: "Sunset Balloon Ride",
          price: 650,
          description: "Quyosh botishida havo shari",
          category_id: 3,
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: "Kategoriya topilmadi" })
  async getCategoryProducts(@Param("id", ParseIntPipe) id: number) {
    return await this.categoryService.getCategoryProducts(id);
  }

  // 7. PATCH - Kategoriyani yangilash
  @Patch(":id")
  @ApiOperation({ summary: "Kategoriyani yangilash" })
  @ApiParam({ name: "id", description: "Kategoriya ID raqami", example: 1 })
  @ApiResponse({
    status: 200,
    description: "Kategoriya muvaffaqiyatli yangilandi",
    example: {
      id: 1,
      name: "Yangilangan nom",
      description: "Yangilangan tavsif",
      parent_id: null,
    },
  })
  @ApiResponse({
    status: 400,
    description: "Noto'g'ri ma'lumotlar yoki circular reference",
  })
  @ApiResponse({ status: 404, description: "Kategoriya yoki parent topilmadi" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return await this.categoryService.update(id, updateCategoryDto);
  }

  // 8. DELETE - Kategoriyani o'chirish
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Kategoriyani o'chirish" })
  @ApiParam({ name: "id", description: "Kategoriya ID raqami", example: 5 })
  @ApiResponse({
    status: 200,
    description: "Kategoriya muvaffaqiyatli o'chirildi",
    example: {
      message: "Category deleted successfully",
      status: 200,
    },
  })
  @ApiResponse({ status: 404, description: "Kategoriya topilmadi" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return await this.categoryService.remove(id);
  }
}
