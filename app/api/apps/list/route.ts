import { db } from "@/lib/db";
import { apps } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const appsList = await db
      .select()
      .from(apps)
      .orderBy(desc(apps.createdAt));

    return NextResponse.json({
      success: true,
      data: appsList,
    });
  } catch (error) {
    console.error("Error fetching apps:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch apps" },
      { status: 500 }
    );
  }
}
