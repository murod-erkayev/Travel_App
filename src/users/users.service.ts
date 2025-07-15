import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException, // Yangi import
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto"; // UpdateUserDto ni import qildik
import * as bcrypt from "bcrypt";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Between, Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { MailService } from "../mail/mail.service";
import { hrtime } from "process";

@Injectable()
export class UsersService {
  // OTP ni vaqtincha saqlash uchun yangilangan Map.
  // Katta ilovalar uchun Redis yoki DB dan foydalanish tavsiya etiladi.
  private otpStorage: Map<string, { userDto: CreateUserDto; expiresAt: Date }> =
    new Map();

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}

  async findByEmail(email: string) {
    const user = this.userRepo.findOne({ where: { email } });
    return user;
  }
  /**
   * Admin tomonidan yangi foydalanuvchi yaratish (OTP talab qilinmaydi).
   * Bunday emailga ega foydalanuvchi mavjud bo'lsa, xato qaytaradi.
   */
  async create(createUserDto: CreateUserDto) {
    const { email, password, confirm_password } = createUserDto;

    if (password !== confirm_password) {
      throw new BadRequestException("Parollar mos emas.");
    }

    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException(
        "Bunday emailga ega foydalanuvchi allaqachon mavjud."
      );
    }

    const password_hashed = await bcrypt.hash(password, 7);

    const newUser = this.userRepo.create({
      ...createUserDto,
      password_hash: password_hashed,
      is_active: true,
      otp: "", // Admin yaratgan foydalanuvchiga OTP kerak emas
    });

    return await this.userRepo.save(newUser);
  }

  /**
   * Barcha foydalanuvchilarni qaytaradi.
   */
  findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  /**
   * Berilgan ID bo'yicha bitta foydalanuvchini topadi.
   * Agar topilmasa, NotFoundException qaytaradi.
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(
        `ID: ${id} bo'yicha foydalanuvchi topilmadi.`
      );
    }
    return user;
  }

  /**
   * Berilgan ID bo'yicha foydalanuvchi ma'lumotlarini yangilaydi.
   * Email yoki telefon raqami allaqachon mavjud bo'lsa, xato beradi.
   */
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

    // Parolni yangilash
    if (updateUserDto.password) {
      if (updateUserDto.password !== updateUserDto.confirm_password) {
        throw new BadRequestException("Parollar mos emas.");
      }
      userToUpdate.password_hash = await bcrypt.hash(updateUserDto.password, 7);
      // DTO dan password va confirm_password ni o'chiramiz, chunki ular entitiyada saqlanmaydi
      delete updateUserDto.password;
      delete updateUserDto.confirm_password;
    }

    // Qolgan maydonlarni yangilash va saqlash
    // Object.assign() yordamida DTO dagi ma'lumotlarni entitiyaga nusxalaymiz
    Object.assign(userToUpdate, updateUserDto);

    return this.userRepo.save(userToUpdate); // O'zgarishlarni bazaga saqlaymiz
  }

  /**
   * Berilgan ID bo'yicha foydalanuvchini o'chiradi.
   * Agar topilmasa, NotFoundException qaytaradi.
   */
  async remove(id: number): Promise<void> {
    // Qaytish turini o'zgartirdik
    const result = await this.userRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `ID: ${id} bo'yicha foydalanuvchi topilmadi.`
      );
    }
  }

  /**
   * Foydalanuvchining refresh tokenini yangilaydi.
   */
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

  /**
   * Refresh token orqali foydalanuvchini topadi.
   */
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

  //=============Rest Password Yani passwordni ozgaritish yani passwor  qoyish uhcun yani posswdi tiklash uchun ishltidai ========================//

  async sendOtpForResetPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(
        "Bunday emailga ega foydalanuvchi topilmadi."
      );
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 daqiqa

    this.otpStorage.set(otpCode, { userDto: { email } as any, expiresAt });

    try {
      await this.mailService.sendMailUser({
        ...user,
        otp: otpCode,
      });

      return {
        message: `OTP ${email} ga yuborildi.`,
        otp: otpCode,
      };
    } catch (error) {
      console.error("OTP yuborishda xatolik:", error);
      throw new BadRequestException("OTP yuborilmadi.");
    }
  }

  // Opt ni tekshirsh va posswrni nul qilib qoyish
  async verifyResetOtp(otp: string) {
    const otpData = this.otpStorage.get(otp);
    if (!otpData || otpData.expiresAt < new Date()) {
      this.otpStorage.delete(otp);
      throw new BadRequestException("OTP noto‘g‘ri yoki muddati tugagan.");
    }

    const user = await this.userRepo.findOne({
      where: { email: otpData.userDto.email },
    });
    if (!user) {
      throw new NotFoundException("Foydalanuvchi topilmadi");
    }

    // is_active true bo'ladi
    user.is_active = true;
    // user.password_hash = ""; // yoki null
    await this.userRepo.save(user);
    this.otpStorage.delete(otp);

    return {
      message: "OTP tasdiqlandi. Endi yangi parol o‘rnating",
      email: user.email,
    };
  }

  // Yanig Passwrd Yozsih uchun
  async resetPassword(
    email: string,
    password: string,
    confirm_password: string
  ) {
    if (password !== confirm_password) {
      throw new BadRequestException("Parollar mos emas.");
    }

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !user.is_active) {
      throw new BadRequestException(
        "Foydalanuvchi mavjud emas yoki tasdiqlanmagan."
      );
    }

    user.password_hash = await bcrypt.hash(password, 7);
    await this.userRepo.save(user);
    return { message: "Yangi parol saqlandi. Endi login qilishingiz mumkin" };
  }

  //Change Password
  async changePassword(
    userId: number,
    new_password: string,
    confirm_password: string,
    old_password: string
  ) {
    if (new_password !== confirm_password) {
      console.log(new_password);
      console.log(confirm_password);
      throw new BadRequestException({ message: "Parollar mos emas" });
    }
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException({ message: "Foydalanuchi topilmadi" });
    }
    const isvalidPassword = await bcrypt.compare(
      old_password,
      user.password_hash
    );
    if (!isvalidPassword) {
      throw new BadRequestException({ message: "Eski Parol Hato" });
    }

    const newPassword = await bcrypt.hash(new_password, 7);
    user.password_hash = newPassword;
    await this.userRepo.save(user);
    return {
      massage: "Parol muvafaqiyatli orgtirlidi",
    };
  }
}
