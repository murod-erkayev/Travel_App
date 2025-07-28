import * as dotenv from "dotenv";
dotenv.config(); // .env faylni yuklaydi

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { join } from "path";
import { WinstonModule } from "nest-winston";
import * as basicAuth from "express-basic-auth";
import { winstonConfig } from "./common/logger/winston.logger";
import { AllExceptionsFilter } from "./common/errors/error.handling";

async function bootstrap() {
  try {
    const PORT = process.env.PORT || 3001; // .env dan portni oladi
    const app = await NestFactory.create(AppModule, {
      logger: WinstonModule.createLogger(winstonConfig),
    });

    // Swaggerga parol qo‘shamiz
    app.use(
      ["/api/docs"],
      basicAuth({
        users: { kottaAdmin: "12345" }, // login: kottaAdmin, parol: 12345
        challenge: true,
      })
    );

    app.use(cookieParser()); // cookie parser qo‘shiladi
    app.useGlobalPipes(new ValidationPipe()); // DTO va validatsiya uchun
    app.setGlobalPrefix("api"); // barcha endpointlar /api/ bilan boshlanadi
    app.useGlobalFilters(new AllExceptionsFilter()); // global xatolik filteri

    console.log("Uploads path:", join(__dirname, "..", "uploads")); // uploads katalogi

    // Swagger sozlamalari
    const config = new DocumentBuilder()
      .setTitle("Nasiya Savdo")
      .setDescription("Nasiya Savdo REST API")
      .setVersion("1.0")
      .addTag("NestJs")
      .addTag("Swagger")
      .addTag("SendMail")
      .addTag("Tokens")
      .addTag("Validation")
      .addTag("Sequelize")
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);
    await app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server started at http://localhost:${PORT}`);
      console.log(`📚 Swagger docs: http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
  }
}

bootstrap();
