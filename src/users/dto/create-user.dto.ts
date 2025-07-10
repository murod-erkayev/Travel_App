import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsUrl,
  MinLength,
  Matches,
  ValidateIf,
} from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "test@example.com", description: "Email manzili" })
  @IsOptional()
  @IsEmail({}, { message: "Email noto‘g‘ri" })
  email?: string;

  @ApiProperty({ example: "+998901234567", description: "Telefon raqami" })
  phone_number: string;

  @ApiProperty({
    example: "Parol123!",
    description: "Parol (kamida 6 ta belgi)",
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: "Parol kamida 6 belgidan iborat bo‘lishi kerak" })
  password: string;

  @ApiProperty({ example: "Parol123!", description: "Parolni tasdiqlang" })
  @IsOptional()
  @IsString()
  @MinLength(6, {
    message: "Parol tasdiqlovchi ham kamida 6 belgidan iborat bo‘lishi kerak",
  })
  confirm_password: string;

  @ApiProperty({ example: "Ali Valiyev", description: "To‘liq ism" })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiProperty({ example: "Uzbekiston", description: "Yashash manzili" })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: "Toshkent", description: "Yashash manzili" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: "Toshkent shahar", description: "Yashash manzili" })
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiProperty({
    example: "go'zal kochasi 35 uy",
    description: "Yashash manzili",
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: 1234567890,
    description: "Google hisob ID (ixtiyoriy)",
  })
  @IsOptional()
  @IsNumber()
  googleId?: number;

  @ApiProperty({ example: "123456", description: "OTP tasdiqlash kodi" })
  @IsOptional()
  @IsString()
  otp: string;

  @ApiProperty({
    example: "https://example.com/photo.jpg",
    description: "Profil rasmi URL manzili",
  })
  @IsOptional()
  @IsUrl({}, { message: "To‘g‘ri URL kiriting" })
  img_url?: string;
}
