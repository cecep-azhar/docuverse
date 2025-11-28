import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function addSettings() {
  try {
    // Check if settings table exists
    const result = await db.run(sql`
      SELECT name FROM sqlite_master WHERE type='table' AND name='settings';
    `);
    
    console.log("Checking if settings table exists...");
    
    // Create settings table if it doesn't exist
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY NOT NULL,
        brand_name TEXT DEFAULT 'Docuverse' NOT NULL,
        brand_logo TEXT,
        brand_description TEXT,
        primary_color TEXT DEFAULT '#000000',
        updated_at INTEGER DEFAULT (strftime('%s', 'now')) NOT NULL
      )
    `);
    
    console.log("✅ Settings table created or already exists");
    
    // Insert default settings if table is empty
    await db.run(sql`
      INSERT OR IGNORE INTO settings (id, brand_name, brand_description)
      VALUES ('default', 'Docuverse', 'Beautiful open-source documentation platform')
    `);
    
    console.log("✅ Default settings inserted");
    
  } catch (error) {
    console.error("Error adding settings table:", error);
    process.exit(1);
  }
}

addSettings()
  .then(() => {
    console.log("✅ Migration complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
