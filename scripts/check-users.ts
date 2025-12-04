import { createClient } from "@libsql/client";

const client = createClient({
  url: "file:local.db",
});

async function checkUsers() {
  try {
    const result = await client.execute("SELECT email, role FROM users");
    console.log("\n=== Users in database ===");
    if (result.rows.length === 0) {
      console.log("No users found!");
    } else {
      result.rows.forEach((user) => {
        console.log(`Email: ${user.email} | Role: ${user.role}`);
      });
    }
    console.log("========================\n");
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit(0);
}

checkUsers();
