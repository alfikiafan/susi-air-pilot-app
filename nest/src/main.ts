import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import type { AppConfig } from './config/app.config.js';
import { APP_CONFIG } from './core/config.token.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<AppConfig>(APP_CONFIG);

  app.enableCors({ origin: config.corsOrigins });
  configureApp(app);

  const swagger = new DocumentBuilder()
    .setTitle('Susi Air Pilot API')
    .setDescription(`Pilot app backend. "Today" is fixed at ${config.today}.`)
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, () =>
    SwaggerModule.createDocument(app, swagger),
  );

  app.enableShutdownHooks();
  await app.listen(config.port, '0.0.0.0');
}
await bootstrap();
