import { db } from "../lib/db";
import { sql } from "drizzle-orm";
import { pageViews } from "../lib/schema";

async function checkMonthlyViews() {
  try {
    console.log("Checking monthly page views data...\n");
    
    // Check all page views
    const allViews = await db.select().from(pageViews).limit(5);
    console.log("Sample page views:", JSON.stringify(allViews, null, 2));
    
    // Check monthly grouped data with unix timestamp conversion
    console.log("Testing queries...\n");
    
    // First, check raw timestamp value
    const raw = await db.execute(sql`SELECT viewed_at FROM page_views LIMIT 1`);
    console.log("Raw timestamp:", raw.rows[0]);
    
    const monthlyViewsData = await db
      .select({
        month: sql<string>`strftime('%Y-%m', datetime(viewed_at / 1000, 'unixepoch'))`,
        count: sql<number>`count(*)`
      })
      .from(pageViews)
      .groupBy(sql`strftime('%Y-%m', datetime(viewed_at / 1000, 'unixepoch'))`)
      .orderBy(sql`strftime('%Y-%m', datetime(viewed_at / 1000, 'unixepoch')) DESC`)
      .limit(12);

    console.log("\nMonthly data from DB (with timestamp conversion):");
    console.log(JSON.stringify(monthlyViewsData, null, 2));
    
    console.log("\nTotal months with data:", monthlyViewsData.length);
    
    // Test mapping
    const now = new Date();
    const months: string[] = [];
    const viewsPerMonth: number[] = [];
    const monthlyMap = new Map(monthlyViewsData.map(d => [d.month, Number(d.count)]));
    
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toISOString().slice(0, 7); // YYYY-MM
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      months.push(label);
      viewsPerMonth.push(monthlyMap.get(monthStr) || 0);
    }
    
    console.log("\nMapped monthly labels:", months);
    console.log("Mapped monthly data:", viewsPerMonth);
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkMonthlyViews();
