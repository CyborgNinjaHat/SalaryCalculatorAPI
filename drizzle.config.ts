import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DB_FILE_NAME;

if (!databaseUrl) {
  throw new Error('DB_FILE_NAME environment variable is not defined');
}

export default defineConfig({
  schema: './src/database/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  verbose: true,
  dbCredentials: {
    url: databaseUrl,
  },
});
