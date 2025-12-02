import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export type UserRole = 'super_admin' | 'admin';

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  
  if (!session) {
    return null;
  }

  const userId = session.value;
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
  };
}

// Permission checks
export function canDelete(userRole: UserRole): boolean {
  return userRole === 'super_admin';
}

export function canCreate(userRole: UserRole): boolean {
  return true; // Both roles can create
}

export function canEdit(userRole: UserRole): boolean {
  return true; // Both roles can edit
}

export function canView(userRole: UserRole): boolean {
  return true; // Both roles can view
}

export function canManageUsers(userRole: UserRole): boolean {
  return userRole === 'super_admin';
}

export function canManageSettings(userRole: UserRole): boolean {
  return userRole === 'super_admin';
}
