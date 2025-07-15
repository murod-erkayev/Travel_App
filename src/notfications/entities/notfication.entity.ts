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

@Entity("notifications") // Table nomini to'g'rilash
export class Notfication {
  // Notfication -> Notification
  @ApiProperty({
    example: 1,
    description: "Notification ID raqami (avtomatik yaratiladi)",
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 1,
    description: "Foydalanuvchi ID raqami",
  })
  @Column()
  user_id: number;

  @ApiProperty({
    example: "Yangi xabar",
    description: "Bildirishnoma sarlavhasi",
  })
  @Column()
  title: string;

  @ApiProperty({
    example: "Sizga yangi xabar keldi",
    description: "Bildirishnoma matni",
  })
  @Column()
  message: string;

  @ApiProperty({
    example: "info",
    description: "Bildirishnoma turi (info, warning, success, error)",
  })
  @Column()
  notification_type: string; // notfication_type -> notification_type

  @ApiProperty({
    example: false,
    description: "O'qilgan yoki yo'qligi",
  })
  @Column({ default: false })
  is_read: boolean;

  @ApiProperty({
    description: "Yaratilgan vaqt",
  })
  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ApiProperty({
    description: "Bildirishnoma egasi",
    type: () => User,
    required: false,
  })
  @ManyToOne(() => User, (user) => user.notfication)
  @JoinColumn({ name: "user_id" })
  user: User;
}
