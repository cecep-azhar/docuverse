import { db } from "@/lib/db";
import { apps } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { getSettings } from "@/lib/settings";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ appSlug: string }> }) {
  const { appSlug } = await params;
  const app = await db.query.apps.findFirst({
    where: eq(apps.slug, appSlug),
  });
  if (!app) return { title: "Not Found" };
  return {
    title: app.name,
    description: app.description,
    icons: {
        icon: app.logoUrl || "/favicon.ico",
    }
  };
}

export default async function PublicAppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ appSlug: string }>;
}) {
  const { appSlug } = await params;
  const app = await db.query.apps.findFirst({
    where: eq(apps.slug, appSlug),
  });

  if (!app) {
    notFound();
  }

  const settingsData = await getSettings();

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
        {children}
        <footer className="border-t py-4 px-4 sm:px-6 text-center flex justify-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Powered by {settingsData.brandName || app.name} © {new Date().getFullYear()}
          </p>
        </footer>
    </div>
  );
}
