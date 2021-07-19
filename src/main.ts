import { NestFactory } from '@nestjs/core';
import { LppModule } from './lpp.module';

async function bootstrap() {
  const app = await NestFactory.create(LppModule);
  await app.listen(3000);
}
bootstrap();
