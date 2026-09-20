import { StandardSchemaValidationPipe, type INestApplication } from '@nestjs/common';

export const configureApplication = (app: INestApplication) => {
  app.useGlobalPipes(
    new StandardSchemaValidationPipe({
      transform: true,
    }),
  );
  app.enableCors();
  app.enableShutdownHooks();
};
