import { Location } from "./../../locations/entities/location.entity";
import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  Entity,
  OneToMany,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";

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

  @Column({ nullable: true })
  rating: number;

  @Column({ nullable: true })
  is_active: boolean;

  @Column({ nullable: true })
  parent_id: number;
  // Parent relationship

  @ApiProperty({
    description: "Ota kategoriya (agar mavjud bo'lsa)",
    type: () => Category,
    required: false,
  })
  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  @JoinColumn({ name: "parent_id" })
  parent: Category;

  @ApiProperty({
    description: "Bolalar kategoriyalar",
    type: () => [Category],
    required: false,
  })
  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @ApiProperty({
    description: "Ushbu kategoriyaga tegishli locationlar",
    type: () => [Location],
    required: false,
  })
  @OneToMany(() => Location, (location) => location.category)
  location: Location[];
}
