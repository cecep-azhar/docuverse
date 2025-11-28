import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import { drizzle as drizzleLibSQL } from 'drizzle-orm/libsql';
import { drizzle as drizzleBetterSQLite } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const isTurso = !!process.env.TURSO_DATABASE_URL;

// Ensure singletons in dev hot-reload
const globalForDb = globalThis as unknown as {
  db?: any;
};

export function getDb() {
  if (globalForDb.db) return globalForDb.db as any;

  if (isTurso) {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    const db = drizzleLibSQL(client, { schema });
    globalForDb.db = db;
    return db;
  }

  const sqlite = new Database('sqlite.db');
  const db = drizzleBetterSQLite(sqlite, { schema });
  globalForDb.db = db;
  return db;
}

export type DB = ReturnType<typeof getDb>;
