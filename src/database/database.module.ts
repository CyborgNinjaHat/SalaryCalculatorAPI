import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-sqlite';
import { DatabaseSync } from 'node:sqlite';
import { relations } from './relations.js';

export const DATABASE = Symbol('DATABASE_CONNECTION');

@Global()
@Module({
  providers: [
    {
      provide: DATABASE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseFile = config.getOrThrow<string>('DB_FILE_NAME');
        const sqlite = new DatabaseSync(databaseFile);
        return drizzle({ client: sqlite, relations });
      },
    },
  ],
  exports: [DATABASE],
})
export class DatabaseModule {}
