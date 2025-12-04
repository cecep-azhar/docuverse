import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.development.local", override: true });
dotenv.config({ path: ".env", override: true });

const isProduction = process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN;

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  dbCredentials: isProduction 
    ? {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
      }
    : {
        url: "file:./local.db",
      },
  verbose: true,
  // Tambah migrasi page_views
});