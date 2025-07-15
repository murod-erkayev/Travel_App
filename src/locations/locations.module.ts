import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { CategoryModule } from '../category/category.module';

@Module({
  imports:[TypeOrmModule.forFeature([
    Location
  ]), CategoryModule],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports:[LocationsService]
})
export class LocationsModule {}
