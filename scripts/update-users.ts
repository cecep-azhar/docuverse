import { createClient } from "@libsql/client";
import { config } from "dotenv";
import bcrypt from "bcryptjs";

config({ path: ".env" });

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function updateUsers() {
  console.log("🔄 Updating users...");

  const passwordHash = bcrypt.hashSync("12345678", 10);

  try {
    // Update super admin
    await client.execute({
      sql: `UPDATE users SET email = ?, password_hash = ? WHERE role = 'super_admin'`,
      args: ["superadmin@gmail.com", passwordHash],
    });

    console.log("✅ Super Admin updated!");
    console.log("📧 Email: superadmin@gmail.com");
    console.log("🔑 Password: 12345678");
    console.log("");

    // Update regular admin
    await client.execute({
      sql: `UPDATE users SET email = ?, password_hash = ? WHERE role = 'admin'`,
      args: ["admin@gmail.com", passwordHash],
    });

    console.log("✅ Admin updated!");
    console.log("📧 Email: admin@gmail.com");
    console.log("🔑 Password: 12345678");
    console.log("");

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

updateUsers();
