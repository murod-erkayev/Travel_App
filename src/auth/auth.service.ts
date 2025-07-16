import { UsersService } from "./../users/users.service";
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ConflictException,
  UnprocessableEntityException, // Qo'shish kerak
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
  // async signInUser(signInDto: LoginDto, res: Response) {
  //   const user = await this.usersService.findByEmail(signInDto.email);
  //   if (!user) {
  //     throw new BadRequestException("Email yoki Password noto'g'ri");
  //   }
  //   if (!user.is_active) {
  //     throw new BadRequestException("Avval Emailni tasdiqlang");
  //   }

  //   const isValidPassword = await bcrypt.compare(
  //     signInDto.password,
  //   );
  //   if (!isValidPassword) {
  //     throw new BadRequestException("Email yoki Password noto'g'ri");
  //   }

  //   const { accessToken, refreshToken } = await this.generateTokensUser(user);
  //   res.cookie("refresh_token", refreshToken, {
  //     httpOnly: true,
  //     maxAge: Number(process.env.COOKIE_TIME),
  //   });

  //   user.hashed_refresh_token = await bcrypt.hash(refreshToken, 7);
  //   await this.usersService.updateRefreshToken(
  //     user.id,
  //     user.hashed_refresh_token
  //   );

  //   return {
  //     message: "Tizimga xush kelibsiz",
  //     accessToken,
  //   };
  // }
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
      // 4. Token generation
      const { accessToken, refreshToken } = await this.generateTokensUser(user);

      // 5. Refresh token saqlash
      const hashed_refresh_token = await bcrypt.hash(refreshToken, 7);
      await this.usersService.updateRefreshToken(user.id, hashed_refresh_token);

      // 6. Cookie ga refresh token saqlash
      if (res) {
        res.cookie("refresh_token", refreshToken, {
          httpOnly: true,
          maxAge: Number(process.env.COOKIE_TIME),
        });
      }

      return {
        message: "Muvaffaqiyatli!",
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          is_active: true,
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
    const user = await this.usersService.findByEmail(email);
    if (user && user.is_active) {
      return {
        isRegister: true,
        message: "Foydalanuvchi allaqachon rohatdan otgan",
        status: 201,
      };
    } else {
      return {
        isRegister: false,
        message: "Foydalanuvchi hali registratsiya qilinmagan",
        status: 422,
      };
    }
  }
  async getProfile(id: number) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new BadRequestException({ message: "Bunday user mavjud emas" });
    }
    const { hashed_refresh_token, otp, otp_expires_at, ...cleanUser } = user;
    return cleanUser;
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
          address: updatedUser.address,
          img_url: updatedUser.img_url,
        },
      };
    } catch (error) {
      // Sizning usersService'dagi errorlar avtomatik throw bo'ladi
      throw error;
    }
  }
}





