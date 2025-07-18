
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { CategoryModule } from './category/category.module';
import { LocationsModule } from './locations/locations.module';
import { NotficationsModule } from './notfications/notfications.module';
import { SearchHistoryModule } from './search_history/search_history.module';
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal:true }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.PG_HOST,
      port: Number(process.env.PG_PORT),
      username: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DB,
      entities: [__dirname+"/**/*.entity{.ts,.js}"],
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/api/uploads', 
    }),
    UsersModule,
    AuthModule,
    CategoryModule,
    LocationsModule,
    NotficationsModule,
    SearchHistoryModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
