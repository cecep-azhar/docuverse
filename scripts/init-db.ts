import Database from "libsql";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcryptjs";

const db = new Database("local.db");

console.log("Initializing fresh database...");

// Drop all tables
db.exec(`DROP TABLE IF EXISTS pages;`);
db.exec(`DROP TABLE IF EXISTS languages;`);
db.exec(`DROP TABLE IF EXISTS versions;`);
db.exec(`DROP TABLE IF EXISTS users;`);
db.exec(`DROP TABLE IF EXISTS settings;`);
db.exec(`DROP TABLE IF EXISTS apps;`);

// Create apps table
db.exec(`
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
db.exec(`
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
db.exec(`
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
db.exec(`
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
db.exec(`
  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin'
  );
`);

// Create settings table
db.exec(`
  CREATE TABLE settings (
    id TEXT PRIMARY KEY,
    brand_name TEXT NOT NULL DEFAULT 'Docuverse',
    brand_logo TEXT,
    brand_description TEXT,
    primary_color TEXT DEFAULT '#000000',
    updated_at INTEGER NOT NULL
  );
`);

console.log("✅ Tables created");

// Seed admin user
const adminId = uuidv4();
const passwordHash = bcrypt.hashSync("admin", 10);

db.prepare(`
  INSERT INTO users (id, email, password_hash, role)
  VALUES (?, ?, ?, ?)
`).run(adminId, "admin@docuverse.com", passwordHash, "admin");

console.log("✅ Admin user created (admin@docuverse.com / admin)");

// Seed default settings
db.prepare(`
  INSERT INTO settings (id, brand_name, brand_description, updated_at)
  VALUES (?, ?, ?, ?)
`).run("default", "Docuverse", "Beautiful open-source documentation platform", Math.floor(Date.now() / 1000));

console.log("✅ Default settings created");

// Seed demo app
const appId = uuidv4();
const versionId = uuidv4();
const languageId = uuidv4();
const now = Math.floor(Date.now() / 1000);

db.prepare(`
  INSERT INTO apps (id, slug, name, description, logo_url, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(
  appId,
  "docuverse",
  "Docuverse",
  "Official Docuverse documentation",
  "https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/book-open.svg",
  now,
  now
);

db.prepare(`
  INSERT INTO versions (id, app_id, slug, name, is_default)
  VALUES (?, ?, ?, ?, ?)
`).run(versionId, appId, "v1", "1.0", 1);

db.prepare(`
  INSERT INTO languages (id, app_id, code, name, is_default)
  VALUES (?, ?, ?, ?, ?)
`).run(languageId, appId, "en", "English", 1);

// Create demo pages
const page1Id = uuidv4();
const page2Id = uuidv4();

db.prepare(`
  INSERT INTO pages (id, app_id, version_id, language_id, slug, title, content, \`order\`, parent_id, is_folder, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  page1Id,
  appId,
  versionId,
  languageId,
  "introduction",
  "Introduction",
  "# Welcome to Docuverse\n\nThis is a demo documentation page.\n\n## Features\n\n- Multi-app support\n- Version control\n- Multi-language\n- Beautiful UI",
  0,
  null,
  0,
  now,
  now
);

db.prepare(`
  INSERT INTO pages (id, app_id, version_id, language_id, slug, title, content, \`order\`, parent_id, is_folder, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  page2Id,
  appId,
  versionId,
  languageId,
  "installation",
  "Installation",
  "# Installation\n\n## Quick Start\n\n```bash\nnpm install docuverse\n```\n\n## Configuration\n\nEdit your config file...",
  1,
  null,
  0,
  now,
  now
);

console.log("✅ Demo app 'Docuverse' created with 2 pages");
console.log("\n🎉 Database initialized successfully!");
console.log("\nYou can now:");
console.log("- Visit http://localhost:3000");
console.log("- Login to admin at http://localhost:3000/admin");
console.log("- Credentials: admin@docuverse.com / admin");

db.close();
