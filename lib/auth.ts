import { db } from "./db";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function getUser(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  return user;
}

export async function getUserById(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  return user;
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function validateSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  
  if (!session) {
    return null;
  }

  // Verify user still exists
  const user = await getUserById(session.value);
  if (!user) {
    // User deleted, return null (middleware will handle redirect)
    return null;
  }

  return user;
}

