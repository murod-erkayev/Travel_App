import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateLocationDto } from "./dto/create-location.dto";
import { UpdateLocationDto } from "./dto/update-location.dto";
import { Location } from "./entities/location.entity";
import { CategoryService } from "../category/category.service";

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    private categoryService: CategoryService // ← Category service inject qildik
  ) {}

  // CREATE
  async create(createLocationDto: CreateLocationDto) {
    const { categoryId } = createLocationDto;
    const category = await this.categoryService.findOne(categoryId!)
    if (!category) {
      throw new BadRequestException({ message: "Not found Id Category" });
    }
    const location = this.locationRepository.create({
      ...createLocationDto,
      category,
    });
    return await this.locationRepository.save(location);
  }

  // READ ALL
  async findAll() {
    return await this.locationRepository.find({
      relations: ["category"],
    });
  }

  // READ ONE
  async findOne(id: number) {
    const location = await this.locationRepository.findOne({
      where: { id: id },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return location;
  }

  // UPDATE
  async update(id: number, updateLocationDto: UpdateLocationDto) {
    const location = await this.findOne(id);

    // Agar category_id yangilanayotgan bo'lsa, tekshirish
    if (updateLocationDto.categoryId) {
      try {
        await this.categoryService.findOne(updateLocationDto.categoryId);
      } catch (error) {
        throw new BadRequestException(
          `Category with ID ${updateLocationDto.categoryId} not found`
        );
      }
    }
    Object.assign(location, updateLocationDto);
    return await this.locationRepository.save(location);
  }
  // DELETE
  async remove(id: number) {
    const location = await this.findOne(id);
    await this.locationRepository.remove(location);
    return { message: `Location deleted successfully` };
  }
}
