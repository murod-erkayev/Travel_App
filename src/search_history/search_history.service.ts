import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateSearchHistoryDto } from "./dto/create-search_history.dto";
import { UpdateSearchHistoryDto } from "./dto/update-search_history.dto";
import { SearchHistory } from "./entities/search_history.entity";
import { UsersService } from "../users/users.service";

@Injectable()
export class SearchHistoryService {
  constructor(
    @InjectRepository(SearchHistory)
    private searchHistoryRepository: Repository<SearchHistory>,
    private readonly userService:UsersService
  ) {}

  async create(
    createSearchHistoryDto: CreateSearchHistoryDto
  ){
    const {userId} = createSearchHistoryDto
    const user = await this.userService.findOne(userId)
    if(!user){
      throw new BadRequestException({message:"Not found Id User "})
    }
    const searchHistory = this.searchHistoryRepository.create({
      ...createSearchHistoryDto,
      user,
    });
    return await this.searchHistoryRepository.save(searchHistory);
  }

  async findAll(): Promise<SearchHistory[]> {
    return await this.searchHistoryRepository.find({
      relations: ["user"],
    });
  }

  async findOne(id: number): Promise<SearchHistory> {
    const searchHistory = await this.searchHistoryRepository.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!searchHistory) {
      throw new Error(`Search history with ID ${id} not found`);
    }

    return searchHistory;
  }

  // async findByUserId(userId: number): Promise<SearchHistory[]> {
  //   return await this.searchHistoryRepository.find({
  //     where: { userId:userId },
  //     relations: ["user"],
  //   });
  // }

  async update(
    id: number,
    updateSearchHistoryDto: UpdateSearchHistoryDto
  ): Promise<SearchHistory> {
    const searchHistory = await this.findOne(id);

    Object.assign(searchHistory, updateSearchHistoryDto);

    return await this.searchHistoryRepository.save(searchHistory);
  }

  async remove(id: number): Promise<void> {
    const searchHistory = await this.findOne(id);
    await this.searchHistoryRepository.remove(searchHistory);
  }

  // async removeByUserId(userId: number): Promise<void> {
  //   await this.searchHistoryRepository.delete({ user_id: userId });
  // }
}
