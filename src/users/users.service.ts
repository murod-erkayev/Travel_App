import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException, // Yangi import
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto"; // UpdateUserDto ni import qildik
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository, UnorderedBulkOperation } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { MailService } from "../mail/mail.service";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}
  async findByEmail(email: string) {
    const user = this.userRepo.findOne({ where: { email } });
    return user;
  }
  async create(createUserDto: CreateUserDto) {
    const { email } = createUserDto;
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException(
        "Bunday emailga ega foydalanuvchi allaqachon mavjud."
      );
    }
    const newUser = this.userRepo.create({
      ...createUserDto,
    });
    return await this.userRepo.save(newUser);
  }
  findAll(): Promise<User[]> {
    return this.userRepo.find();
  }
  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(
        `ID: ${id} bo'yicha foydalanuvchi topilmadi.`
      );
    }
    return user;
  }
  async update(id: number, updateUserDto: UpdateUserDto) {
    const userToUpdate = await this.userRepo.findOne({ where: { id } });
    if (!userToUpdate) {
      throw new NotFoundException(
        `ID: ${id} bo'yicha foydalanuvchi topilmadi.`
      );
    }
    // Emailni tekshirish
    if (updateUserDto.email && updateUserDto.email !== userToUpdate.email) {
      const existingEmailUser = await this.userRepo.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingEmailUser) {
        throw new ConflictException(
          "Bunday emailga ega foydalanuvchi allaqachon mavjud."
        );
      }
    }
    // Telefon raqamini tekshirish
    if (
      updateUserDto.phone_number &&
      updateUserDto.phone_number !== userToUpdate.phone_number
    ) {
      const existingPhoneUser = await this.userRepo.findOne({
        where: { phone_number: updateUserDto.phone_number },
      });
      if (existingPhoneUser) {
        throw new ConflictException(
          "Bunday telefon raqamli foydalanuvchi allaqachon mavjud."
        );
      }
    }
    const updatedUser = { ...userToUpdate, ...updateUserDto };
    return this.userRepo.save(updatedUser); // O'zgarishlarni bazaga saqlaymiz
  }
  async remove(id: number): Promise<void> {
    // Qaytish turini o'zgartirdik
    const result = await this.userRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `ID: ${id} bo'yicha foydalanuvchi topilmadi.`
      );
    }
  }
  async updateRefreshToken(id: number, hashed_refresh_token: string | null) {
    const updateResult = await this.userRepo.update(id, {
      hashed_refresh_token,
    });
    if (updateResult.affected === 0) {
      throw new NotFoundException(
        `ID: ${id} bo'yicha foydalanuvchi topilmadi.`
      );
    }
    return updateResult;
  }
  async findByToken(refresh_token: string): Promise<User | undefined> {
    if (!refresh_token) {
      throw new BadRequestException("Refresh token mavjud emas."); // NotFoundException o'rniga BadRequestException
    }

    try {
      const decoded = this.jwtService.verify(refresh_token, {
        secret: process.env.REFRESH_TOKEN_KEY,
      }) as { id: number };

      const user = await this.findOne(decoded.id); // 'admin' o'rniga 'user' ishlatildi
      return user;
    } catch (error) {
      // Token yaroqsiz yoki muddati o'tgan bo'lsa
      console.error(
        "Yaroqsiz yoki muddati o‘tgan refresh token:",
        error.message
      );
      return undefined; // Foydalanuvchi topilmasa undefined qaytariladi
    }
  }
  public async save(user: User): Promise<User> {
    return await this.userRepo.save(user);
  }
  async updateOtp(id: number, otp: string, expiresAt: Date) {
    return await this.userRepo.update(id, {
      otp: otp,
      otp_expires_at: expiresAt,
    });
  }
  async findByEmailAndOtp(email: string, otp: string) {
    console.log(email, otp);
    return await this.userRepo.findOne({ where: { email, otp } });
  }
  async clearOtpAndActivate(id: number) {
    return await this.userRepo.update(id, {
      otp: "",
      otp_expires_at: undefined,
      is_active: true,
    });
  }
}
