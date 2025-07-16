// users.module.ts
import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./entities/users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { MailModule } from "../mail/mail.module";
// AuthModule ni import qilmaslik!

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MailModule,
    // AuthModule ni o'chirib tashlash
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
