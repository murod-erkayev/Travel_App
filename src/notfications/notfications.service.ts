import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateNotficationDto } from "./dto/create-notfication.dto";
import { Notfication } from "./entities/notfication.entity";
import { UpdateNotficationDto } from "./dto/update-notfication.dto";
import { UsersService } from "../users/users.service";
@Injectable()
export class NotficationsService {
  constructor(
    @InjectRepository(Notfication)
    private notificationRepository: Repository<Notfication>,
    private readonly userService:UsersService
  ) {}

  async create(createNotificationDto: CreateNotficationDto) {
    const { userId } = createNotificationDto;
    const user = await this.userService.findOne(userId);
    if(!user){
        throw   new BadRequestException({message:"Not Found User Id"})
    }

    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      user,
    });
    return await this.notificationRepository.save(notification);
  }
  async findAll() {
    return await this.notificationRepository.find({
      relations: ["user"],
    });
  }

  async findOne(id: number) {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!notification) {
      throw new Error(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  // async findByUserId(userId: number) {
  //   return await this.notificationRepository.find({
  //     where: { user_id: userId },
  //     relations: ["user"],
  //     order: { id: "DESC" },
  //   });
  // }

  async update(id: number, updateNotificationDto: UpdateNotficationDto) {
    const notification = await this.findOne(id);

    Object.assign(notification, updateNotificationDto);

    return await this.notificationRepository.save(notification);
  }

  async remove(id: number) {
    const notification = await this.findOne(id);
    await this.notificationRepository.remove(notification);
  }

  async markAsRead(id: number) {
    return await this.update(id, { is_read: true });
  }

  // async markAllAsRead(userId: number) {
  //   await this.notificationRepository.update(
  //     { user_id: userId },
  //     { is_read: true }
  //   );
  // }
}
