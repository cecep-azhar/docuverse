// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load env lebih agresif (override true, tapi ini masih gagal di npx)
dotenv.config({ path: ".env.development.local", override: true });
dotenv.config({ path: ".env", override: true });

// Debug log (hapus setelah jalan)
console.log("TURSO_DATABASE_URL:", process.env.TURSO_DATABASE_URL ? "Loaded" : "MISSING");
console.log("TURSO_AUTH_TOKEN:", process.env.TURSO_AUTH_TOKEN ? "Loaded" : "MISSING");

export default defineConfig({
  schema: "./src/lib/db/schema.ts", // Path schema kamu
  out: "./drizzle",
  dialect: "turso", // FIX: Pakai dialect "turso" (standar untuk Turso, tanpa driver field)
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL || "file:./dev.db", // Fallback local
    authToken: process.env.TURSO_AUTH_TOKEN, // Wajib untuk cloud
  },
  verbose: true,
});