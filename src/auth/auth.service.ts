import { UsersService } from "./../users/users.service";
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ConflictException, // Qo'shish kerak
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { LoginDto } from "./dto/create-auth.dto";
import { Request, Response } from "express";

import { CreateUserDto } from "../users/dto/create-user.dto";
import { User } from "../users/entities/user.entity";
import { MailService } from "../mail/mail.service";

@Injectable()
export class AuthService {
  private otpStorage: Map<string, { userDto: CreateUserDto; expiresAt: Date }> =
    new Map();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}

  async singUpUser(dto: CreateUserDto) {
    const newAdmin = await this.usersService.create(dto);
    return { message: "Foydalanuvchi qo'shildi", userId: newAdmin.id };
  }

  async generateTokensUser(user: User) {
    const payload = {
      id: user.id,
      is_active: user.is_active,
      email: user.email,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.ACCESS_TOKEN_TIME,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME,
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async signInUser(signInDto: LoginDto, res: Response) {
    const user = await this.usersService.findByEmail(signInDto.email);
    if (!user) {
      throw new BadRequestException("Email yoki Password noto'g'ri");
    }
    if (!user.is_active) {
      throw new BadRequestException("Avval Emailni tasdiqlang");
    }

    const isValidPassword = await bcrypt.compare(
      signInDto.password,
      user.password_hash
    );
    if (!isValidPassword) {
      throw new BadRequestException("Email yoki Password noto'g'ri");
    }

    const { accessToken, refreshToken } = await this.generateTokensUser(user);
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: Number(process.env.COOKIE_TIME),
    });

    user.hashed_refresh_token = await bcrypt.hash(refreshToken, 7);
    await this.usersService.updateRefreshToken(
      user.id,
      user.hashed_refresh_token
    );

    return {
      message: "Tizimga xush kelibsiz",
      accessToken,
    };
  }

  async logOutUser(req: Request, res: Response) {
    const token = req.cookies["refresh_token"];
    if (!token) {
      console.log("Token1", token);
      throw new BadRequestException({ message: "Bunday Token Yo'q" });
    }
    const user = await this.usersService.findByToken(token);
    if (!user)
      throw new BadRequestException({ message: "Bunday Token Topilmadi" });
    user.hashed_refresh_token = "";
    this.usersService.save(user);
    res.clearCookie("refresh_token");
    return res.json({ message: "Tizimdan muvafaqiyatli chiqdinggiz" });
  }

  async refreshTokenUser(req: Request, res: Response) {
    const refresh_token = req.cookies["refresh_token"];
    if (!refresh_token) {
      throw new BadRequestException("Refresh Token not available!");
    }
    const payload = await this.jwtService.verify(refresh_token, {
      secret: process.env.REFRESH_TOKEN_KEY,
    });
    const user = await this.usersService.findOne(payload.id);
    if (!user || !user.hashed_refresh_token) {
      throw new BadRequestException("User Not Found or have not log in yet!");
    }
    const isValid = await bcrypt.compare(
      refresh_token,
      user.hashed_refresh_token
    );
    if (!isValid) throw new UnauthorizedException("Refresh Token noto'g'ri");
    const { accessToken, refreshToken } = await this.generateTokensUser(user);
    const hashed_refresh_token = await bcrypt.hash(refreshToken, 7);
    user.hashed_refresh_token = hashed_refresh_token;
    this.usersService.save(user);

    res.cookie("refresh_token", refreshToken, {
      maxAge: Number(process.env.COOKIE_TIME),
      httpOnly: true,
    });
    return { RefreshToken: refreshToken };
  }

  // OTP yuborish va saqlash (to'g'rilangan versiya)
  async sendEmailOtp(createUserDto: CreateUserDto) {
    const { email } = createUserDto;

    // Mavjud foydalanuvchini tekshirish
    const existingUser = await this.usersService.findByEmail(email!);
    if (existingUser) {
      throw new ConflictException(
        "Bunday emailga ega foydalanuvchi allaqachon mavjud."
      );
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresInMinutes = 5; // OTPning amal qilish muddati 5 daqiqa
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    // OTPni va CreateUserDto ni muddati bilan saqlaymiz
    this.otpStorage.set(otpCode, { userDto: createUserDto, expiresAt });

    try {
      await this.mailService.sendMailUser({
        ...(createUserDto as any),
        email: createUserDto.email,
        full_name: createUserDto.full_name,
        otp: otpCode,
      } as unknown as User);

      // Test uchun OTPni qaytarish production muhitida o'chirib tashlanishi kerak!
      return {
        message: `OTP ${email} ga muvaffaqiyatli yuborildi.`,
        otp: otpCode,
      };
    } catch (error) {
      console.error("Emailga OTP yuborishda xatolik yuz berdi:", error);
      throw new BadRequestException(
        "OTP yuborishda muammo yuz berdi, keyinroq urinib ko'ring."
      );
    }
  }
  async activateUser(otp: string, res: Response) {
    if (!otp) {
      throw new BadRequestException("OTP kiritilmagan.");
    }

    const otpData = this.otpStorage.get(otp);
    if (!otpData || otpData.expiresAt < new Date()) {
      this.otpStorage.delete(otp);
      throw new BadRequestException("OTP noto'g'ri yoki muddati tugagan.");
    }

    const createUserDto = otpData.userDto;
    const { password, confirm_password } = createUserDto;

    if (password !== confirm_password) {
      throw new BadRequestException("Parollar mos emas.");
    }

    try {
      // UsersService orqali user yaratish
      const savedUser = await this.usersService.create({
        ...createUserDto,
        is_active: true,
        otp: "", // Bo'sh qilib qo'yish
      } as CreateUserDto); // Type assertion qo'shish

      // Token generatsiya qilish
      const { accessToken, refreshToken } =
        await this.generateTokensUser(savedUser);

      // Refresh token ni hash qilib saqlash
      const hashed_refresh_token = await bcrypt.hash(refreshToken, 7);
      await this.usersService.updateRefreshToken(
        savedUser.id,
        hashed_refresh_token
      );

      // Cookie ga refresh token ni saqlash
      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        maxAge: Number(process.env.COOKIE_TIME),
      });

      // OTP ni o'chirish
      this.otpStorage.delete(otp);

      return {
        message: "Foydalanuvchi muvaffaqiyatli yaratildi va aktivlashtirildi.",
        user: {
          id: savedUser.id,
          full_name: savedUser.full_name,
          email: savedUser.email,
          phone_number: savedUser.phone_number,
          country: savedUser.country,
          city: savedUser.city,
          is_active: savedUser.is_active,
        },
        accessToken, // Bu token frontend ga yuboriladi
        // refreshToken cookie da saqlanadi (httpOnly)
      };
    } catch (error) {
      console.error("Foydalanuvchini DB ga saqlashda xatolik:", error);
      throw new BadRequestException(
        "Foydalanuvchini ro'yxatdan o'tkazishda muammo yuz berdi."
      );
    }
  }
}
