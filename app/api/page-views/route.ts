import { db } from "@/lib/db";
import { pageViews } from "@/lib/schema";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const { pageId } = await request.json();

    if (!pageId) {
      return Response.json(
        { error: "pageId is required" },
        { status: 400 }
      );
    }

    // Catat page view
    await db.insert(pageViews).values({
      id: uuidv4(),
      pageId,
      viewedAt: new Date(),
    });

    return Response.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error recording page view:", error);
    return Response.json(
      { error: "Failed to record page view" },
      { status: 500 }
    );
  }
}
