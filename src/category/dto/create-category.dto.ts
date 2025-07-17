import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional, isNotEmpty, IsNumber, isNumber, IsBoolean } from "class-validator";

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
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: "img_dsfsgsf.png",
    description: "Category Rasmini yubrish uchun",
    required: false,
  })
  @IsOptional()
  @IsString()
  category_img_url?: string;

  @ApiProperty({
    example: "true",
    description: "is_active Rasmini yubrish uchun",
    required: false,
  })
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    example: "1",
    description: "Parent Id",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  parent_id?: number;
}
