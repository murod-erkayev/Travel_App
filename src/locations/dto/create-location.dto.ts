import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsUrl,
  IsIn,
} from "class-validator";

export class CreateLocationDto {
  @ApiProperty({
    example: "Cappadocia Air Balloon",
    description: "Location nomi",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: "Amazing hot air balloon experience",
    description: "Qisqa tavsif",
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example:
      "Experience the breathtaking views of Cappadocia from high above in a hot air balloon. This unforgettable journey offers stunning sunrise views over the fairy chimneys and rock formations.",
    description: "To'liq batafsil tavsif",
    required: false,
  })
  @IsString()
  @IsOptional()
  full_description?: string;

  @ApiProperty({
    example: "Goreme",
    description: "Shahar nomi",
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    example: "Turkey",
    description: "Davlat nomi",
    required: false,
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({
    example: "38.643345",
    description: "Kenglik (latitude) koordinatasi",
    required: false,
  })
  @IsString()
  @IsOptional()
  latitude?: string;

  @ApiProperty({
    example: "34.831472",
    description: "Uzunlik (longitude) koordinatasi",
    required: false,
  })
  @IsString()
  @IsOptional()
  longtitude?: string;

  @ApiProperty({
    example: "https://example.com/cappadocia-balloon.jpg",
    description: "Asosiy rasm URL manzili",
    required: false,
  })
  @IsUrl()
  @IsOptional()
  main_img?: string;

  @ApiProperty({
    example: "200.00",
    description: "Asosiy narx (USD)",
    required: false,
  })
  @IsString()
  @IsOptional()
  base_price?: string;

  @ApiProperty({
    example: 1,
    description: "Category ID raqami",
    required: false,
  })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({
    example: "true",
    description: "Faollik holati (true - faol, false - nofaol)",
    required: false,
    enum: ["true", "false"],
  })
  @IsString()
  @IsIn(["true", "false"])
  @IsOptional()
  is_active?: string;
}
