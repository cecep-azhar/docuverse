import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db.select().from(settings).limit(1);
    return NextResponse.json(result[0] || {
      brandName: "Docuverse",
      brandDescription: "Open source documentation platform",
      brandLogo: null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { brandName, brandDescription, brandLogo, primaryColor } = await req.json();

    const existing = await db.select().from(settings).limit(1);

    if (existing.length > 0) {
      await db
        .update(settings)
        .set({
          brandName,
          brandDescription,
          brandLogo,
          primaryColor,
          updatedAt: new Date(),
        })
        .where(eq(settings.id, existing[0].id));
    } else {
      await db.insert(settings).values({
        id: "default",
        brandName,
        brandDescription,
        brandLogo,
        primaryColor,
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings save error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
