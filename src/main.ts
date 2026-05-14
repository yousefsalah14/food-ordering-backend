import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { MulterExceptionFilter } from './utils/multer-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  const swaggerPath = configService.get<string>('app.swaggerPath', 'docs');
  const port = configService.get<number>('app.port', 3000);
  const frontendUrl = configService.get<string>(
    'app.frontendUrl',
    'http://localhost:5173',
  );
  const uploadsPath = join(process.cwd(), 'uploads');

  app.setGlobalPrefix(apiPrefix);
  app.enableCors({
    origin: [frontendUrl, 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new MulterExceptionFilter());
  app.useStaticAssets(uploadsPath, { prefix: '/uploads/' });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Food Ordering API')
    .setDescription('Food Ordering System APIs')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description:
        'Paste only the JWT access token, without the Bearer prefix.',
    })
    .addServer(`/${apiPrefix}`, 'API')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(swaggerPath, app, document, {
    useGlobalPrefix: false,
    customSiteTitle: 'Food Ordering API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      displayRequestDuration: true,
      defaultModelsExpandDepth: -1,
      defaultModelExpandDepth: 1,
      docExpansion: 'none',
    },
  });

  await app.listen(port);
  console.log(`API is running on http://localhost:${port}/${apiPrefix}`);
  console.log(
    `Swagger docs are available at http://localhost:${port}/${swaggerPath}`,
  );
}

void bootstrap();
