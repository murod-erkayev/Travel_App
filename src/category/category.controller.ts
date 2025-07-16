import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { JwtAuthGuard } from "../common/guards/user.guard";
@ApiTags("Categories")
@Controller("category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  //=====Post=====//
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Yangi kategoriya yaratish" })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: "Kategoriya muvaffaqiyatli yaratildi",
    example: {
      id: 1,
      name: "Adventure",
      description: "Sarguzasht va ekstremal faoliyatlar",
      category_img_url: "img_asdfgd12.png",
    },
  })
  @ApiResponse({ status: 400, description: "Noto'g'ri ma'lumotlar" })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: "Barcha kategoriyalarni olish" })
  @ApiResponse({
    status: 200,
    description: "Kategoriyalar ro'yxati muvaffaqiyatli qaytarildi",
    example: [
      {
        id: 1,
        name: "Adventure",
        description: "Sarguzasht va ekstremal faoliyatlar",
        category_img_url: "img_asdfgd12.png",

        locations: [],
      },
    ],
  })
  findAll() {
    return this.categoryService.findAll();
  }

  //===Get====//
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(":id")
  @ApiOperation({ summary: "ID bo'yicha kategoriyani olish" })
  @ApiParam({
    name: "id",
    description: "Kategoriya ID raqami",
    example: 1,
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "Kategoriya topildi",
    example: {
      id: 1,
      name: "Adventure",
      description: "Sarguzasht va ekstremal faoliyatlar",
      category_img_url: "img_asdfgd12.png",
      locations: [],
    },
  })
  @ApiResponse({ status: 404, description: "Kategoriya topilmadi" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  //=====Patch===//
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(":id")
  @ApiOperation({ summary: "Kategoriyani yangilash" })
  @ApiParam({
    name: "id",
    description: "Kategoriya ID raqami",
    example: 1,
    type: "number",
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: "Kategoriya muvaffaqiyatli yangilandi",
    example: {
      id: 1,
      name: "Updated Adventure",
      description: "Yangilangan tavsif",
      category_img_url: "img_asdfgd12.png",
    },
  })
  @ApiResponse({ status: 404, description: "Kategoriya topilmadi" })
  @ApiResponse({ status: 400, description: "Noto'g'ri ma'lumotlar" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  //====Delete==//
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(":id")
  @ApiOperation({ summary: "Kategoriyani o'chirish" })
  @ApiParam({
    name: "id",
    description: "Kategoriya ID raqami",
    example: 1,
    type: "number",
  })
  @ApiResponse({
    status: 200,
    description: "Kategoriya muvaffaqiyatli o'chirildi",
    example: {
      message: "Category deleted successfully",
    },
  })
  @ApiResponse({ status: 404, description: "Kategoriya topilmadi" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }
}
