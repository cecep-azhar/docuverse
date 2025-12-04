import { NextResponse } from "next/server";
import { validateSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await validateSession();
    
    if (!user) {
      return NextResponse.json(
        { error: "Session invalid" },
        { status: 401 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json(
      { error: "Session validation failed" },
      { status: 500 }
    );
  }
}
