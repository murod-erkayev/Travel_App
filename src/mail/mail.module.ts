import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { Inject, Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { ConfigService } from "@nestjs/config";
import { config } from "process";
import { join } from "path";

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get<string>("SMTP_HOST"),
          secure: false,
          auth: {
            user: config.get<string>("SMTP_USER"),
            pass: config.get<string>("SMTP_PASSWORD"),
          },
        },
        defaults:{
          from:`"TravelApp"<${config.get<string>("SMTP_HOST")}`
        },
        template:{
          dir:join(__dirname,"templates"),
          adapter:new HandlebarsAdapter(),
          template:"confirmation",
          options: {
            strict:true,
          }
        }
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
