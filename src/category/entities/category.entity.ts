import { Location } from "./../../locations/entities/location.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("category")
export class Category {
  @ApiProperty({
    example: 1,
    description: "Category ID raqami (avtomatik yaratiladi)",
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: "Adventure",
    description: "Kategoriya nomi",
  })
  @Column()
  name: string;

  @ApiProperty({
    example: "Sarguzasht va ekstremal faoliyatlar",
    description: "Kategoriya tavsifi",
    required: false,
  })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({
    example: "img_dsfsgsf.png",
    description: "Category Rasmini yubrish uchun",
    required: false,
  })
  @Column({ nullable: true })
  category_img_url: string;

  @ApiProperty({
    description: "Ushbu kategoriyaga tegishli locationlar",
    type: () => [Location],
    required: false,
  })
  @OneToMany(() => Location, (location) => location.category)
  location: Location[]; // location emas, locations bo'lishi kerak
}
