import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Foydalanuvchining email manzili',
    required: true,
  })
  @IsEmail({}, { message: 'Email noto‘g‘ri kiritilgan' })
  email: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'Foydalanuvchining paroli. Kamida 6 ta belgidan iborat bo‘lishi kerak.',
    required: true,
    minLength: 6,
  })
  @IsString({ message: 'Parol faqat matn bo‘lishi kerak' })
  @MinLength(6, { message: 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak' })
  password: string;
}
