import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const useTurso = !!process.env.TURSO_DATABASE_URL;

export default defineConfig({
  schema: './lib/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  driver: useTurso ? 'turso' : 'better-sqlite',
  dbCredentials: useTurso
    ? {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }
    : {
        url: 'sqlite.db',
      },
});
