import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Category } from "../../category/entities/category.entity";

@Entity("locations") // Table nomini aniqlashtirish
export class Location {
  @ApiProperty({
    example: 1,
    description: "Location ID raqami (avtomatik yaratiladi)",
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: "Cappadocia Air Balloon",
    description: "Location nomi",
  })
  @Column()
  name: string;

  @ApiProperty({
    example: "Amazing hot air balloon experience",
    description: "Qisqa tavsif",
  })
  @Column()
  description: string;

  @ApiProperty({
    example:
      "Experience the breathtaking views of Cappadocia from high above in a hot air balloon. This unforgettable journey offers stunning sunrise views over the fairy chimneys and rock formations.",
    description: "To'liq batafsil tavsif",
    required: false,
  })
  @Column({ nullable: true })
  full_description: string;

  @ApiProperty({
    example: "Goreme",
    description: "Shahar nomi",
  })
  @Column()
  city: string;

  @ApiProperty({
    example: "Turkey",
    description: "Davlat nomi",
    required: false,
  })
  @Column({ nullable: true })
  country: string;

  @ApiProperty({
    example: "38.643345",
    description: "Kenglik (latitude) koordinatasi",
    required: false,
  })
  @Column({ nullable: true })
  latitude: string;

  @ApiProperty({
    example: "34.831472",
    description: "Uzunlik (longitude) koordinatasi",
    required: false,
  })
  @Column({ nullable: true })
  longtitude: string;

  @ApiProperty({
    example: "https://example.com/cappadocia-balloon.jpg",
    description: "Asosiy rasm URL manzili",
    required: false,
  })
  @Column({ nullable: true })
  main_img: string;

  @ApiProperty({
    example: "200.00",
    description: "Asosiy narx (USD)",
    required: false,
  })
  @Column({ nullable: true })
  base_price: string;

  @ApiProperty({
    example: 1,
    description: "Category ID raqami (kategoriya bog'lanishi)",
    required: false,
  })
  @Column({ nullable: true })
  category_id: number;

  @ApiProperty({
    example: "true",
    description: "Faollik holati (true - faol, false - nofaol)",
    required: false,
  })
  @Column({ nullable: true,default:true })
  is_active: string;

  // Relations
  @ApiProperty({
    description: "Location kategoriyasi",
    type: () => Category,
    required: false,
  })
  @ManyToOne(() => Category, (category) => category.location)
  @JoinColumn({ name: "category_id" })
  category: Category;
}
