import { NextResponse } from "next/server";
import { db } from "@docuverse/database";
import { apps } from "@docuverse/database";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Simple query to check connection
    await db.select().from(apps).limit(1);
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch (error) {
    return NextResponse.json({ status: "error", message: String(error) }, { status: 500 });
  }
}

