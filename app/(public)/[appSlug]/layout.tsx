import { db } from "@/lib/db";
import { apps } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";

export async function generateMetadata({ params }: { params: { appSlug: string } }) {
  const app = await db.query.apps.findFirst({
    where: eq(apps.slug, params.appSlug),
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
  params: { appSlug: string };
}) {
  const app = await db.query.apps.findFirst({
    where: eq(apps.slug, params.appSlug),
  });

  if (!app) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
        {children}
    </div>
  );
}
