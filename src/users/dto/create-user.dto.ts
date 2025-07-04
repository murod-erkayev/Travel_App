import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUrl,
  MinLength,
  Matches,
} from 'class-validator';
export class CreateUserDto {
  @ApiProperty({ example: 'test@example.com', description: 'Email manzili' })
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+998901234567', description: 'Telefon raqami' })
  @IsString()
  @Matches(/^\+998\d{9}$/, { message: 'Telefon raqami +998 bilan boshlanishi va 9 ta raqamdan iborat bo‘lishi kerak' })
  phone_number: string;

  @ApiProperty({ example:'Parol123!', description:'Parol (kamida 6 ta belgi)' })
  @IsString()
  @MinLength(6)
  password: string; 

  @ApiProperty({ example: 'Parol123!', description: 'Parol (kamida 6 ta belgi)' })
  @IsString()
  @MinLength(6)
  confirm_password: string;

  @ApiProperty({ example: 'https://example.com/photo.jpg', description: 'Profil rasmi URL manzili' })
  @IsOptional()
  @IsUrl()
  img_url: string;

  @ApiProperty({ example: 'Ali Valiyev', description: 'Full Name' })
  @IsString()
  full_name: string;

  @ApiProperty({ example: 'Toshkent', description: 'Manzili' })
  @IsString()
  location: string;

  @ApiProperty({ example: 1234567890, description: 'Google hisob ID raqami (ixtiyoriy)' })
  @IsOptional()
  @IsNumber()
  googleId: number;

  
  @ApiProperty({ example: 1234567890, description: 'Google hisob ID raqami (ixtiyoriy)' })
  @IsOptional()
  @IsNumber()
  otp: string;
}
