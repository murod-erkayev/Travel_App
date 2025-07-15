import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional } from "class-validator";

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
  @IsOptional()
  description?: string;
}
