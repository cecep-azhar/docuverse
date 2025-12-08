import { db } from "../lib/db";
import { sql } from "drizzle-orm";
import { pageViews } from "../lib/schema";

async function checkMonthlyViews() {
  try {
    console.log("Checking monthly page views data...\n");
    
    // Check monthly grouped data
    const monthlyViewsData = await db
      .select({
        month: sql<string>`strftime('%Y-%m', viewed_at, 'unixepoch')`,
        count: sql<number>`count(*)`
      })
      .from(pageViews)
      .groupBy(sql`strftime('%Y-%m', viewed_at, 'unixepoch')`)
      .orderBy(sql`strftime('%Y-%m', viewed_at, 'unixepoch') DESC`)
      .limit(12);

    console.log("Monthly data from DB:");
    console.log(JSON.stringify(monthlyViewsData, null, 2));
    
    console.log("\nTotal months with data:", monthlyViewsData.length);
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkMonthlyViews();
