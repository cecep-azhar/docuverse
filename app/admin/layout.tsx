import { Metadata } from "next";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settingsData = await getSettings();
  
  return {
    title: `Admin Login - ${settingsData.brandName}`,
    description: settingsData.brandDescription || `Admin login for ${settingsData.brandName}`,
    icons: {
      icon: settingsData.brandLogo || "/favicon.ico",
    },
  };
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      {children}
    </div>
  );
}

