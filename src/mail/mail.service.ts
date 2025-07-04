import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
@Injectable()
export class MailService {
    constructor(private readonly mailerSerivce: MailerService) {}
    async sendMailUser(user:User){
        const otp = user.otp
        console.log(otp);// test uchun 
        await this.mailerSerivce.sendMail({
            to: user.email,
            subject: 'Welcome to Travel App',
            template: './confirmation', 
            context: { 
                name: user.full_name,
                otp,
             }, 
        });
    }
}
