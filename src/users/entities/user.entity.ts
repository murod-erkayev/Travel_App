import { Notfication } from './../../notfications/entities/notfication.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { SearchHistory } from '../../search_history/entities/search_history.entity';

@Entity()
export class User {
  @ApiProperty({
    example: 1,
    description: "Foydalanuvchi ID raqami (avtomatik yaratiladi)",
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: "Erkayev Murod",
    description: "To‘liq ism",
  })
  @Column()
  full_name: string;

  @ApiProperty({
    example: "test@example.com",
    description: "Email manzili",
  })
  @Column()
  email: string;

  @ApiProperty({
    example: "+998901234567",
    description: "Telefon raqami",
  })
  @Column({ nullable: true })
  phone_number: string;


  @ApiProperty({
    example: "Uzbekiston",
    description: "Yashash manzili",
  })
  @Column({ nullable: true })
  country: string;

  @ApiProperty({
    example: "Toshkent",
    description: "Yashash manzili",
  })
  @Column({ nullable: true })
  city: string;

  @ApiProperty({
    example: "Toshkent shahar",
    description: "Yashash manzili",
  })
  @Column({ nullable: true })
  zip: string;

  @ApiProperty({
    example: "go'zla kochasi 34 uy",
    description: "Yashash manzili",
  })
  @Column({ nullable: true })
  address: string;

  @ApiProperty({
    example: "https://example.com/photo.jpg",
    description: "Foydalanuvchi rasmi (URL)",
    required: false,
  })
  @Column({ nullable: true })
  img_url: string;

  @ApiProperty({
    example: 1234567890,
    description: "Google account ID (raqamli)",
    required: false,
  })
  @Column({ nullable: true })
  googleId: number;

  @ApiProperty({
    example: "123456",
    description: "Tasdiqlash uchun OTP kodi (ixtiyoriy)",
    required: false,
  })
  @Column({ nullable: true })
  otp: string;

  @ApiProperty({
    example: "hashed_refresh_token_example",
    description: "Hashed refresh token",
    required: false,
  })
  @Column({ type: "text", nullable: true })
  hashed_refresh_token: string | null;

  @ApiProperty({
    example: true,
    description: "Foydalanuvchi faolligi (true yoki false)",
  })
  @Column({ default: false })
  is_active: boolean;

  @Column({ nullable: true })
  otp_expires_at?: Date;

  @OneToMany(() => Notfication, (notfication) => notfication.user)
  notfication: Notfication[];

  @OneToMany(() => SearchHistory, (searchHistory) => searchHistory.user)
  searchHistory: SearchHistory[];
}
