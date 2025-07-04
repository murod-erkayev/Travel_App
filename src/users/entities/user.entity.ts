import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @ApiProperty({ example: 1, description: 'Foydalanuvchi ID raqami (avtomatik yaratiladi)' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'test@example.com', description: 'Email manzili' })
  @Column()
  email: string;

  @ApiProperty({ example: '+998901234567', description: 'Telefon raqami' })
  @Column()
  phone_number: string;

  @ApiProperty({ example: 'hashed_password_here', description: 'Hashlangan parol' })
  @Column()
  password_hash: string;

  @ApiProperty({ example: 'https://example.com/photo.jpg', description: 'Foydalanuvchi rasmi (URL)' })
  @Column()
  img_url: string;

  @ApiProperty({ example: 'Erkayev Murod', description: 'Full Name' })
  @Column()
  full_name: string;

  @ApiProperty({ example: 'Toshkent', description: 'Yashash manzili' })
  @Column()
  location: string;

  @ApiProperty({ example: 1234567890, description: 'Google account ID (raqamli)' })
  @Column()
  googleId: number;

  @ApiProperty({ example: 1234567890, description: 'Google account ID (raqamli)' })
  @Column({nullable:true})
  otp: string;
  
  @ApiProperty({ example: "user, admin", description: 'Role' })
  @Column()
  role:string

  @ApiProperty({ example: 'hashed_refresh_token_example', description: 'Hashed refresh token', default: " " })
  @Column({type: 'text', nullable: true})
  hashed_refresh_token: string |null

  @ApiProperty({ example: true, description: 'Foydalanuvchi faolligi (true yoki false)' })
  @Column({default:false})
  is_active: boolean;
}
