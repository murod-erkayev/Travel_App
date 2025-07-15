import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  IsIn,
} from "class-validator";

export class CreateNotficationDto {
  @ApiProperty({
    example: 1,
    description: "Foydalanuvchi ID raqami",
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    example: "Yangi xabar",
    description: "Bildirishnoma sarlavhasi",
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: "Sizga yangi xabar keldi",
    description: "Bildirishnoma matni",
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    example: "info",
    description: "Bildirishnoma turi",
    enum: ["info", "warning", "success", "error"],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(["info", "warning", "success", "error"])
  notification_type: string; // notfication_type -> notification_type

  @ApiProperty({
    example: false,
    description: "O'qilgan yoki yo'qligi",
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_read?: boolean;
}
