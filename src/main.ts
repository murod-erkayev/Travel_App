import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import {DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { WinstonModule } from 'nest-winston';
import * as basicAuth from 'express-basic-auth';
import { winstonConfig } from './common/logger/winston.logger';
import { AllExceptionsFilter } from './common/errors/error.handling';

async function bootstrap() {
  try {
    const PORT = process.env.PORT || 3030;
    const app = await NestFactory.create(AppModule,{
      logger:WinstonModule.createLogger(winstonConfig)}
    );
      app.use(
        ['/api/docs'],
        basicAuth({
          users: { kottaAdmin: '12345' },
          challenge: true,
        }),
          )    
    app.use(cookieParser());

    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new AllExceptionsFilter());
    console.log(join(__dirname, '..', 'uploads'));
    const config = new DocumentBuilder()
      .setTitle('Nasiya Savdo')
      .setDescription('Nasiya Savdo REST API')
      .setVersion('1.0')
      .addTag('NestJs')
      .addTag('Swagger')
      .addTag('SendMail')
      .addTag('Tokens')
      .addTag('Validation')
      .addTag('Sequelize')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    await app.listen(PORT, () => {
      console.log(`Server started at http://localhost:${PORT}`);
      console.log(`Swagger docs available at http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    console.error(error);
  }
}
bootstrap();
