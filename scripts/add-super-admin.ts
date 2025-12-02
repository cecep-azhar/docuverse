import { createClient } from "@libsql/client";
import { config } from "dotenv";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

config({ path: ".env" });

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function addSuperAdmin() {
  console.log("🚀 Adding Super Admin user...");

  const superAdminId = uuidv4();
  const passwordHash = bcrypt.hashSync("superadmin", 10);

  try {
    await client.execute({
      sql: `INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      args: [superAdminId, "superadmin@docuverse.com", passwordHash, "super_admin"],
    });

    console.log("✅ Super Admin user created!");
    console.log("📧 Email: superadmin@docuverse.com");
    console.log("🔑 Password: superadmin");
    console.log("\n");

    // Update existing admin to regular admin
    await client.execute({
      sql: `UPDATE users SET role = 'admin' WHERE email = 'admin@docuverse.com'`,
      args: [],
    });

    console.log("✅ Existing admin updated to regular admin role");
    console.log("📧 Email: admin@docuverse.com");
    console.log("🔑 Password: admin");
    console.log("\n");

    // Show all users
    const users = await client.execute({
      sql: `SELECT id, email, role FROM users`,
      args: [],
    });

    console.log("👥 All users:");
    console.table(users.rows);

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    client.close();
  }
}

addSuperAdmin();
