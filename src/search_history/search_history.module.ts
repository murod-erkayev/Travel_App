import { Module } from '@nestjs/common';
import { SearchHistoryService } from './search_history.service';
import { SearchHistoryController } from './search_history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchHistory } from './entities/search_history.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports:[TypeOrmModule.forFeature([
    SearchHistory
  ]),UsersModule],
  controllers: [SearchHistoryController],
  providers: [SearchHistoryService],
})
export class SearchHistoryModule {}
