import { db } from "../lib/db";
import { sql } from "drizzle-orm";
import { pageViews } from "../lib/schema";

async function checkMonthlyViews() {
  try {
    console.log("Checking page views...\n");
    
    // Just test the query directly WITHOUT division
    const monthlyViewsData = await db
      .select({
        month: sql<string>`strftime('%Y-%m', viewed_at, 'unixepoch')`,
        count: sql<number>`count(*)`
      })
      .from(pageViews)
      .groupBy(sql`strftime('%Y-%m', viewed_at, 'unixepoch')`)
      .orderBy(sql`strftime('%Y-%m', viewed_at, 'unixepoch') DESC`)
      .limit(12);

    console.log("Monthly data:");
    console.log(JSON.stringify(monthlyViewsData, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkMonthlyViews();
