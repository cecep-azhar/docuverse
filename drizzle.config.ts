import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export default defineConfig({
  schema: './lib/schema.ts',
  out: './migrations',
dialect: 'sqlite',          // WAJIB: sqlite untuk Turso (libSQL-based)
  driver: 'turso',            // Ini yang enable Turso support
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
