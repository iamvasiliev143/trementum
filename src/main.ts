import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { envDto } from './config/validate-env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  app.setGlobalPrefix('api/v1');

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = app.get<ConfigService<envDto>>(ConfigService);

  const swaggerTitle = <string>config.get('SWAGGER_TITLE');
  const swaggerDescription = <string>config.get('SWAGGER_DESCRIPTION');
  const swaggerVersion = <string>config.get('SWAGGER_VERSION');
  const swaggerPath = <string>config.get('SWAGGER_PATH');

  const swaggerConfig = new DocumentBuilder()
    .setTitle(swaggerTitle)
    .setDescription(swaggerDescription)
    .setVersion(swaggerVersion)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(swaggerPath, app, document);

  const appPort = <number>config.get('APP_PORT');
  await app.listen(appPort);

  console.log(`API: http://localhost:${appPort}`);
  console.log(`Swagger: http://localhost:${appPort}/${swaggerPath}`);
}
bootstrap();
