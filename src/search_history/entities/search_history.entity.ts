import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "../../users/entities/user.entity";

@Entity("search_history") // Table nomini aniqlashtirish
export class SearchHistory {
  @ApiProperty({
    example: 1,
    description: "Search History ID raqami (avtomatik yaratiladi)",
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 1,
    description: "Foydalanuvchi ID raqami",
  })
  @ApiProperty({
    example: "Cappadocia balloon",
    description: "Qidiruv matni",
  })
  @Column()
  search_query: string;

  @ApiProperty({
    example: "location",
    description: "Qidiruv turi (location, activity, category, general)",
  })
  @Column()
  search_type: string;

  @ApiProperty({
    example: '{"price_range": "100-500", "category": "adventure"}',
    description: "Qidiruv filtrlari JSON formatida",
    required: false,
  })
  @Column({ type: "text", nullable: true })
  filters: string;

  @ApiProperty({
    description: "Qidiruv vaqti",
  })
  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ApiProperty({
    description: "Qidiruv egasi",
    type: () => User,
    required: false,
  })
  @ManyToOne(() => User, (user) => user.searchHistory)
  @JoinColumn({ name: "user_id" })
  user: User;
}
