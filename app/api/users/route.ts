import { NextRequest, NextResponse } from "next/server";
import { db } from "@docuverse/database";
import { users } from "@docuverse/database";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { getCurrentUser, canManageUsers } from "@/lib/permissions";

export const dynamic = 'force-dynamic';

// GET all users
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canManageUsers(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allUsers = await db.select().from(users);
    return NextResponse.json(allUsers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canManageUsers(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, password, role } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const userId = uuidv4();
    const passwordHash = bcrypt.hashSync(password, 10);

    await db.insert(users).values({
      id: userId,
      email,
      name: name || null,
      passwordHash,
      role: role || "admin",
    });

    return NextResponse.json({ success: true, id: userId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

// PUT update user
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canManageUsers(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, email, name, password, role } = body;

    if (!id || !email) {
      return NextResponse.json({ error: "ID and email are required" }, { status: 400 });
    }

    // Check if email already exists for other users
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser && existingUser.id !== id) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const updateData: any = {
      email,
      name: name || null,
      role: role || "admin",
    };

    // Only update password if provided
    if (password) {
      if (password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
      }
      updateData.passwordHash = bcrypt.hashSync(password, 10);
    }

    await db.update(users).set(updateData).where(eq(users.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canManageUsers(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Prevent deleting yourself
    if (id === currentUser.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    await db.delete(users).where(eq(users.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

