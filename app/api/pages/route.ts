import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pages } from "@/lib/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { appId, versionId, languageId, title, slug, content, parentId, isFolder } = await req.json();

    const pageId = uuidv4();

    await db.insert(pages).values({
      id: pageId,
      appId,
      versionId,
      languageId,
      slug,
      title,
      content: content || "",
      order: 0,
      parentId: parentId || null,
      isFolder: isFolder || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, pageId });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, title, content, slug } = await req.json();

    await db
      .update(pages)
      .set({
        title,
        content,
        slug,
        updatedAt: new Date(),
      })
      .where(eq(pages.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    console.log("[API DELETE PAGE] Received request for ID:", id);

    if (!id) {
      console.error("[API DELETE PAGE] No ID provided");
      return NextResponse.json({ error: "Page ID required" }, { status: 400 });
    }

    console.log("[API DELETE PAGE] Deleting page with ID:", id);
    const result = await db.delete(pages).where(eq(pages.id, id));
    console.log("[API DELETE PAGE] Delete result:", result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API DELETE PAGE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 }
    );
  }
}
