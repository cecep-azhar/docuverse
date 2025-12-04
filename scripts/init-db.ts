import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcryptjs";
import * as schema from "../lib/schema";

const client = createClient({
  url: "file:local.db"
});

const db = drizzle(client, { schema });

console.log("Initializing fresh database...");

async function init() {
  // Drop all tables
  await client.execute(`DROP TABLE IF EXISTS page_views;`);
  await client.execute(`DROP TABLE IF EXISTS pages;`);
  await client.execute(`DROP TABLE IF EXISTS languages;`);
  await client.execute(`DROP TABLE IF EXISTS versions;`);
  await client.execute(`DROP TABLE IF EXISTS users;`);
  await client.execute(`DROP TABLE IF EXISTS settings;`);
  await client.execute(`DROP TABLE IF EXISTS apps;`);

  // Create apps table
  await client.execute(`
    CREATE TABLE apps (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      logo_url TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  // Create versions table
  await client.execute(`
    CREATE TABLE versions (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE,
      UNIQUE(app_id, slug)
    );
  `);

  // Create languages table
  await client.execute(`
    CREATE TABLE languages (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE,
      UNIQUE(app_id, code)
    );
  `);

  // Create pages table
  await client.execute(`
    CREATE TABLE pages (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL,
      version_id TEXT NOT NULL,
      language_id TEXT NOT NULL,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      \`order\` INTEGER NOT NULL DEFAULT 0,
      parent_id TEXT,
      is_folder INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE,
      FOREIGN KEY (version_id) REFERENCES versions(id) ON DELETE CASCADE,
      FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE,
      UNIQUE(version_id, language_id, slug)
    );
  `);

  // Create users table
  await client.execute(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create settings table
  await client.execute(`
    CREATE TABLE settings (
      id TEXT PRIMARY KEY,
      brand_name TEXT NOT NULL DEFAULT 'Docuverse',
      brand_logo TEXT,
      brand_description TEXT,
      documentation_name TEXT NOT NULL DEFAULT 'Documentation',
      primary_color TEXT DEFAULT '#000000',
      updated_at INTEGER NOT NULL
    );
  `);

  // Create page_views table
  await client.execute(`
    CREATE TABLE page_views (
      id TEXT PRIMARY KEY,
      page_id TEXT NOT NULL,
      viewed_at INTEGER NOT NULL,
      FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
    );
  `);

  console.log("✅ Tables created");

  // Seed super admin user
  const superAdminId = uuidv4();
  const superAdminPasswordHash = bcrypt.hashSync("superadmin", 10);

  await client.execute({
    sql: `INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)`,
    args: [superAdminId, "superadmin@docuverse.com", superAdminPasswordHash, "super_admin"]
  });

  console.log("✅ Super Admin user created (superadmin@docuverse.com / superadmin)");

  // Seed regular admin user
  const adminId = uuidv4();
  const adminPasswordHash = bcrypt.hashSync("admin", 10);

  await client.execute({
    sql: `INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)`,
    args: [adminId, "admin@docuverse.com", adminPasswordHash, "admin"]
  });

  console.log("✅ Admin user created (admin@docuverse.com / admin)");

  // Seed default settings
  await client.execute({
    sql: `INSERT INTO settings (id, brand_name, brand_description, documentation_name, updated_at) VALUES (?, ?, ?, ?, ?)`,
    args: ["default", "Docuverse", "Beautiful open-source documentation platform", "Documentation", Math.floor(Date.now() / 1000)]
  });

  console.log("✅ Default settings created");

  // Seed demo app
  const appId = uuidv4();
  const versionId = uuidv4();
  const languageId = uuidv4();
  const now = Math.floor(Date.now() / 1000);

  await client.execute({
    sql: `INSERT INTO apps (id, slug, name, description, logo_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      appId,
      "docuverse",
      "Docuverse",
      "Official Docuverse documentation",
      "https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/book-open.svg",
      now,
      now
    ]
  });

  await client.execute({
    sql: `INSERT INTO versions (id, app_id, slug, name, is_default) VALUES (?, ?, ?, ?, ?)`,
    args: [versionId, appId, "v1", "1.0", 1]
  });

  await client.execute({
    sql: `INSERT INTO languages (id, app_id, code, name, is_default) VALUES (?, ?, ?, ?, ?)`,
    args: [languageId, appId, "en", "English", 1]
  });

  // Create demo pages
  const page1Id = uuidv4();
  const page2Id = uuidv4();

  await client.execute({
    sql: `INSERT INTO pages (id, app_id, version_id, language_id, slug, title, content, \`order\`, parent_id, is_folder, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      page1Id,
      appId,
      versionId,
      languageId,
      "introduction",
      "Introduction",
      "<h1>Welcome to Docuverse</h1><p>This is a demo documentation page.</p><h2>Features</h2><ul><li>Multi-app support</li><li>Version control</li><li>Multi-language</li><li>Beautiful UI</li></ul>",
      0,
      null,
      0,
      now,
      now
    ]
  });

  await client.execute({
    sql: `INSERT INTO pages (id, app_id, version_id, language_id, slug, title, content, \`order\`, parent_id, is_folder, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      page2Id,
      appId,
      versionId,
      languageId,
      "installation",
      "Installation",
      "<h1>Installation</h1><h2>Quick Start</h2><pre><code>bash npm install docuverse</code></pre><h2>Configuration</h2><p>Edit your config file...</p><div class=\"youtube-embed\" style=\"position: relative; width: 100%; padding-bottom: 56.25%; margin: 1rem 0;\"><iframe style=\"position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 0.5rem;\" src=\"https://www.youtube.com/embed/AGn74aib6sl\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe></div>",
      1,
      null,
      0,
      now,
      now
    ]
  });

  console.log("✅ Demo app 'Docuverse' created with 2 pages");
  console.log("\n🎉 Database initialized successfully!");
  console.log("\nYou can now:");
  console.log("- Visit http://localhost:3000");
  console.log("- Login to admin at http://localhost:3000/admin");
  console.log("\nAvailable credentials:");
  console.log("  Super Admin: superadmin@docuverse.com / superadmin");
  console.log("  Admin: admin@docuverse.com / admin");

  client.close();
}

init().catch(console.error);
