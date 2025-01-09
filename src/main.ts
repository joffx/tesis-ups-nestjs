import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('tesis-api-logger');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(envs.apiPrefix);
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT || 5003);
  logger.log(`Aplicacion corriendo en: ${envs.hostApi}${envs.apiPrefix}`);
}

bootstrap();
