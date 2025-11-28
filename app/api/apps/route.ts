import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apps, versions, languages } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { name, description, slug } = await req.json();

    const appId = uuidv4();
    const versionId = uuidv4();
    const languageId = uuidv4();

    // Create app
    await db.insert(apps).values({
      id: appId,
      slug,
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create default version
    await db.insert(versions).values({
      id: versionId,
      appId,
      slug: "v1",
      name: "1.0",
      isDefault: true,
    });

    // Create default language
    await db.insert(languages).values({
      id: languageId,
      appId,
      code: "en",
      name: "English",
      isDefault: true,
    });

    return NextResponse.json({ success: true, appId });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create app" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const allApps = await db.select().from(apps);
    return NextResponse.json(allApps);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch apps" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "App ID is required" },
        { status: 400 }
      );
    }

    // Delete app (cascade will delete related versions, languages, and pages)
    await db.delete(apps).where(eq(apps.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete app error:", error);
    return NextResponse.json(
      { error: "Failed to delete app" },
      { status: 500 }
    );
  }
}
