import { db } from "@/lib/db";
import { settings } from "@/lib/schema";

export async function getSettings() {
  try {
    const settingsData = await db.select().from(settings).limit(1);
    return settingsData[0] || {
      brandName: "Docuverse",
      brandLogo: null,
      brandDescription: null,
      primaryColor: "#000000",
    };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return {
      brandName: "Docuverse",
      brandLogo: null,
      brandDescription: null,
      primaryColor: "#000000",
    };
  }
}
