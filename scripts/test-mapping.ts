import { db } from "../lib/db";
import { sql } from "drizzle-orm";
import { pageViews } from "../lib/schema";

async function testMapping() {
  try {
    console.log("Testing monthly mapping...\n");
    
    // Get monthly data from DB
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
    
    // Create map
    const monthlyMap = new Map(monthlyViewsData.map(d => [d.month, Number(d.count)]));
    console.log("\nMonthly map:");
    monthlyMap.forEach((value, key) => console.log(`  ${key}: ${value}`));
    
    // Test mapping logic
    const now = new Date();
    console.log("\nCurrent date:", now.toISOString());
    console.log("Current month:", now.getMonth(), "(0-indexed)");
    console.log("Current year:", now.getFullYear());
    
    const months: string[] = [];
    const viewsPerMonth: number[] = [];
    
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0'); // +1 because getMonth() is 0-indexed
      const monthStr = `${year}-${month}`; // YYYY-MM format
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      const count = monthlyMap.get(monthStr) || 0;
      
      months.push(label);
      viewsPerMonth.push(count);
      
      console.log(`  i=${i} → ${monthStr} (${label}): ${count} views`);
    }
    
    console.log("\nFinal arrays:");
    console.log("Labels:", months);
    console.log("Data:", viewsPerMonth);
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testMapping();
