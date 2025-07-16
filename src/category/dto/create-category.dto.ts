import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional, isNotEmpty } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty({
    example: "Adventure",
    description: "Kategoriya nomi",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: "Sarguzasht va ekstremal faoliyatlar",
    description: "Kategoriya tavsifi",
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiProperty({
    example: "img_dsfsgsf.png",
    description: "Category Rasmini yubrish uchun",
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  category_img_url?: string;
}
