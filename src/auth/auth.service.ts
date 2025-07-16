import { UsersService } from "./../users/users.service";
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ConflictException,
  UnprocessableEntityException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Request, Response } from "express";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { User } from "../users/entities/user.entity";
import { MailService } from "../mail/mail.service";
import { UpdateUserDto } from "../users/dto/update-user.dto";

@Injectable()
export class AuthService {
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
    console.log("GenerateToken=>", payload);

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

  async logOutUser(req: Request, res: Response) {
    const token = req.cookies["refresh_token"];
    if (!token) {
      console.log("Token1", token);
      throw new UnauthorizedException("Refresh token topilmadi");
    }

    try {
      const user = await this.usersService.findByToken(token);
      if (!user) {
        throw new UnauthorizedException("Bunday token topilmadi");
      }

      user.hashed_refresh_token = "";
      await this.usersService.save(user);
      res.clearCookie("refresh_token");

      return { message: "Tizimdan muvaffaqiyatli chiqildi" };
    } catch (error) {
      console.error("Logout da xatolik:", error);
      throw new UnauthorizedException("Logout qilishda xatolik");
    }
  }

  async refreshTokenUser(req: Request, res: Response) {
    const refresh_token = req.cookies["refresh_token"];
    if (!refresh_token) {
      throw new UnauthorizedException("Refresh token topilmadi");
    }

    try {
      const payload = await this.jwtService.verify(refresh_token, {
        secret: process.env.REFRESH_TOKEN_KEY,
      });

      const user = await this.usersService.findOne(payload.id);
      if (!user || !user.hashed_refresh_token) {
        throw new UnauthorizedException("User topilmadi yoki login qilmagan");
      }

      const isValid = await bcrypt.compare(
        refresh_token,
        user.hashed_refresh_token
      );
      if (!isValid) {
        throw new UnauthorizedException("Refresh token noto'g'ri");
      }

      const { accessToken, refreshToken } = await this.generateTokensUser(user);
      const hashed_refresh_token = await bcrypt.hash(refreshToken, 7);

      user.hashed_refresh_token = hashed_refresh_token;
      await this.usersService.save(user);

      res.cookie("refresh_token", refreshToken, {
        maxAge: Number(process.env.COOKIE_TIME),
        httpOnly: true,
      });

      return {
        message: "Token yangilandi",
        accessToken,
      };
    } catch (error) {
      console.error("Refresh token da xatolik:", error);
      throw new UnauthorizedException("Refresh token noto'g'ri");
    }
  }

  async sendOtp(email: string) {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresInMinutes = 5;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    try {
      // User topish yoki yaratish
      let user = await this.usersService.findByEmail(email);

      if (!user) {
        // Yangi user yaratish OTP bilan
        console.log("Opt", otpCode);
        user = await this.usersService.create({
          email: email,
          full_name: "User",
          phone_number: "",
          otp: otpCode,
          otp_expires_at: expiresAt,
          is_active: false, // OTP verify qilguncha false
        } as CreateUserDto);
      } else {
        // Mavjud user ga yangi OTP qo'yish
        await this.usersService.updateOtp(user.id, otpCode, expiresAt);
      }

      // Mail yuborish
      const userForMail = {
        id: user.id,
        email: email,
        full_name: user.full_name,
        phone_number: "",
        otp: otpCode,
      } as User;

      await this.mailService.sendMailUser(userForMail);

      return {
        message: `OTP ${email} ga yuborildi.`,
        otp: otpCode, // Production'da o'chiring
      };
    } catch (error) {
      console.error("OTP yuborishda xatolik:", error);
      throw new BadRequestException("OTP yuborilmadi.");
    }
  }

  async verifyOtp(email: string, otp: string, res?: Response) {
    try {
      // 1. User ni email va OTP bilan topish
      const user = await this.usersService.findByEmailAndOtp(email, otp);

      if (!user) {
        throw new BadRequestException("Email yoki OTP noto'g'ri.");
      }

      // 2. Muddat tekshirish
      if (!user.otp_expires_at || user.otp_expires_at < new Date()) {
        throw new BadRequestException("OTP muddati tugagan.");
      }

      // 3. SUCCESS! OTP ni tozalash va aktivlashtirish
      await this.usersService.clearOtpAndActivate(user.id);

      // 4. FRESH user data olish
      const updatedUser = await this.usersService.findOne(user.id);

      // 5. Token generation (fresh data bilan)
      const { accessToken, refreshToken } =
        await this.generateTokensUser(updatedUser);

      // 6. Refresh token saqlash
      const hashed_refresh_token = await bcrypt.hash(refreshToken, 7);
      await this.usersService.updateRefreshToken(
        updatedUser.id,
        hashed_refresh_token
      );

      // 7. Cookie ga refresh token saqlash
      if (res) {
        res.cookie("refresh_token", refreshToken, {
          httpOnly: true,
          maxAge: Number(process.env.COOKIE_TIME),
        });
      }

      return {
        message: "Muvaffaqiyatli!",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          full_name: updatedUser.full_name,
          is_active: updatedUser.is_active, // Fresh data
        },
        accessToken,
      };
    } catch (error) {
      console.error("OTP verification da xatolik:", error);

      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException("Tasdiqlashda muammo yuz berdi.");
    }
  }

  async checkRegister(email: string) {
    try {
      const user = await this.usersService.findByEmail(email);

      if (user && user.is_active) {
        return {
          isregister: true, // ✅ Swagger'da shunday
          message: "Foydalanuvchi allaqachon ro'yxatdan o'tgan.",
        };
      } else {
        throw new UnprocessableEntityException({
          isregister: false, // ✅ Swagger'da shunday
          message:
            "Siz hali ro'yxatdan o'tmagansiz. Iltimos, ro'yxatdan o'ting.",
        });
      }
    } catch (error) {
      console.error("Check register da xatolik:", error);

      if (error instanceof UnprocessableEntityException) {
        throw error;
      }
      throw new BadRequestException("Tekshirishda xatolik yuz berdi.");
    }
  }

  async getProfile(id: number) {
    try {
      const user = await this.usersService.findOne(id);

      if (!user) {
        throw new BadRequestException("Bunday user mavjud emas");
      }

      // Sensitive ma'lumotlarni olib tashlash
      const { hashed_refresh_token, otp, otp_expires_at, ...cleanUser } = user;

      // ✅ Swagger format'iga mos - direct user object
      return cleanUser;
    } catch (error) {
      console.error("Profile olishda xatolik:", error);

      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException("Profile ma'lumotlarini olishda xatolik.");
    }
  }

  async editProfile(id: number, updateData: UpdateUserDto) {
    try {
      const updatedUser = await this.usersService.update(id, updateData);

      return {
        message: "Profile muvaffaqiyatli yangilandi",
        user: {
          id: updatedUser.id,
          full_name: updatedUser.full_name,
          email: updatedUser.email,
          phone_number: updatedUser.phone_number,
          country: updatedUser.country,
          city: updatedUser.city,
          zip: updatedUser.zip,
          address: updatedUser.address,
          img_url: updatedUser.img_url,
        },
      };
    } catch (error) {
      console.error("Profile yangilashda xatolik:", error);

      // User Service'dagi specific errorlar
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new BadRequestException("Profile yangilashda xatolik yuz berdi.");
    }
  }
}
