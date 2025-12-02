import { NextRequest, NextResponse } from "next/server";
import { db } from "@docuverse/database";
import { pages } from "@docuverse/database";
import { eq, and, or, like } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get("appId");
    const query = searchParams.get("query");

    if (!appId || !query) {
      return NextResponse.json(
        { error: "Missing appId or query" },
        { status: 400 }
      );
    }

    // Search in title and content
    const results = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.appId, appId),
          or(
            like(pages.title, `%${query}%`),
            like(pages.content, `%${query}%`)
          )
        )
      )
      .limit(10);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    );
  }
}

