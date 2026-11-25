import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from '@nestjs/drizzle';
import { drizzle } from 'drizzle-orm/mysql2';
import { AuthModule } from './auth/auth.module.js';
import { AuthenticationModule } from '@nestjs/authentication';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    AuthenticationModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: 'D:\\Developer\\opsflow\\.env',
    }),
    DrizzleModule.forRoot({
      drizzle,
      connection: process.env.DATABASE_URL!,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
