import { Module } from '@nestjs/common';
import { NotficationsService } from './notfications.service';
import { NotficationsController } from './notfications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notfication } from './entities/notfication.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports:[TypeOrmModule.forFeature([
    Notfication
  ]),UsersModule],
  controllers: [NotficationsController],
  providers: [NotficationsService],
})
export class NotficationsModule {}
