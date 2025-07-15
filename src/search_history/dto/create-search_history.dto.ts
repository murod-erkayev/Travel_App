import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsIn,
} from "class-validator";

export class CreateSearchHistoryDto {
  @ApiProperty({
    example: "Cappadocia balloon",
    description: "Qidiruv matni",
  })
  @IsString()
  @IsNotEmpty()
  search_query: string;

  @ApiProperty({
    example: "location",
    description: "Qidiruv turi",
    enum: ["location", "activity", "category", "general"],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(["location", "activity", "category", "general"])
  search_type: string;

  @ApiProperty({
    example: 1,
    description: "Foydalanuvchi ID raqami",
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
