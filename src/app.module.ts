import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReportsModule } from './reports/reports.module';
import { envs } from './config';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ssl: envs.stage === 'prod',
      extra: {
        ssl: envs.stage === 'prod' ? { rejectUnauthorized: false } : null,
      },
      type: 'postgres',
      host: envs.dbHost,
      port: envs.dbPort,
      database: envs.dbName,
      username: envs.dbUser,
      password: envs.dbPass,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ReportsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
