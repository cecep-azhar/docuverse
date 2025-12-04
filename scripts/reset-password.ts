import { createClient } from "@libsql/client";
import * as bcrypt from "bcryptjs";

const client = createClient({
  url: "file:local.db",
});

async function resetPassword() {
  try {
    const email = "superadmin@docuverse.com";
    const newPassword = "admin";
    const passwordHash = bcrypt.hashSync(newPassword, 10);

    await client.execute({
      sql: "UPDATE users SET password_hash = ? WHERE email = ?",
      args: [passwordHash, email],
    });

    console.log(`\n✅ Password reset successfully for ${email}`);
    console.log(`New password: ${newPassword}\n`);
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit(0);
}

resetPassword();
