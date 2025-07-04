import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from "bcrypt";
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../mail/mail.service';

@Injectable()

export class UsersService {
  save(user: User) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService:MailService
  ) {}
  async create(createUserDto: CreateUserDto) {
    const { email, password, confirm_password , phone_number} = createUserDto;
    //Tekshiruv
    if (password !== confirm_password) {
      console.log(password);
      console.log(confirm_password);
      throw new BadRequestException("Parollar mos emas");
    }
    const existingAdminEmail = await this.userRepo.findOne({ where: { email } });
    // if (existingAdminEmail) {
    //   throw new BadRequestException("Bunday emailli foydalanuvchi mavjud");
    // }
    const existingAdmin = await this.userRepo.findOne({ where: [{ phone_number}] });
    if (existingAdmin) {
      throw new BadRequestException("Bunday telefon raqamli foydalanuvchi mavjud");
    }
    function generateOtp(length: number = 6): string {
      return Math.floor(100000 + Math.random() * 900000).toString(); // 6 xonali
    }
    const otpCode = generateOtp(); 
    //Hashed Password
    const password_hashed = await bcrypt.hash(password, 7);
    const newUser = this.userRepo.create({
      ...createUserDto,
      password_hash: password_hashed,
      otp: otpCode,
    });
    try {
      this.mailService.sendMailUser(newUser)
    } catch (error) {
      console.log("Emailga Hat Yuborishda Hatolik Yuzaga Keldi");
    }
    const a =  await this.userRepo.save(newUser);
    return a
}

  findAll() {
    return this.userRepo.find()
  }
  async findOne(id: number) {
    const user = await this.userRepo.findOne({ where: { id }});
    if(!user){
      throw new BadRequestException({message:"Bunday Id Malumot Yoq "})
    }
    return user
  }
  async findByEmail(email:string) {
    const user = await this.userRepo.findOne({where:{email}})
    if(!user){
      throw new BadRequestException({message:"Not Found Email"})
    }
    return user
  }
async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepo.findOne({where:{id}})
    if(!user){
      throw new BadRequestException({message:"Bunday Id Malumotlari mavjud emas"})
    }
    const { email , phone_number} = updateUserDto;
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException("Bunday emailli foydalanuvchi mavjud");
    }
    const existingUser1 = await this.userRepo.findOne({ where: [{ phone_number}] });
    if (existingUser1) {
      throw new BadRequestException("Bunday telefon raqamli foydalanuvchi mavjud");
    }
    if (updateUserDto.password) {
      if (updateUserDto.password !== updateUserDto.confirm_password) {
        throw new BadRequestException("Parollar mos emas");
      }
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        7
      );
      delete updateUserDto.confirm_password;
    }
    return this.userRepo.update(id, updateUserDto);
  }
  remove(id: number) {
    const user = this.userRepo.findOne({where:{id}})
    if(!user){
      throw new BadRequestException({message:"Bunday Id Malumotlari mavjud emas"})
    }
    return this.userRepo.delete(id);
  }
  async updateRefreshToken(id:number , hashed_refresh_token:string|null){
    const Token  = await this.userRepo.update(id, {hashed_refresh_token})
    if(Token.affected===0){
      throw new BadRequestException({message:`User with ID ${id} not found`})
    }
    return Token
  }
  async findByToken(refresh_token:string){
    if(!refresh_token){
      throw new NotFoundException({massage:"Bunday token mavjud emas"})
    }
    try {
      const decoded = this.jwtService.verify(refresh_token, {
        secret:process.env.REFRESH_TOKEN_KEY
      }) as {id:number}
      const admin = await this.findOne(decoded.id)
      console.log("User.Servisdagi Admin=>Id",admin);
      return admin
    } catch (error) {
      console.log("Invalid or Expired refresh Token");
    }
  }

  async activateUser(otp: string) {
    if (!otp) {
      throw new BadRequestException("Activation otp not found");
    }
    const user = await this.userRepo.findOne({ where: { otp: otp } });
    if (!user) {
      throw new BadRequestException("Activation otp is invalid");
    }
    if (user.is_active) {
      throw new BadRequestException("User already activated");
    }
    user.is_active = true
    await this.userRepo.save(user);
    return {
      message: "User Activated Successfully",
      is_active: user.is_active,
    };
  }
}
