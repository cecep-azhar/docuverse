import { db } from "@/lib/db";
import { apps } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { validateSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppSettingsClient from "./settings-client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AppSettingsPage({ 
  params 
}: { 
  params: Promise<{ appId: string }>;
}) {
  const user = await validateSession();
  if (!user) {
    redirect("/admin");
  }

  const { appId } = await params;
  
  const app = await db.query.apps.findFirst({
    where: eq(apps.id, appId),
  });

  if (!app) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/dashboard/apps/${appId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">App Settings</h2>
          <p className="text-muted-foreground mt-1">{app.name}</p>
        </div>
      </div>

      <AppSettingsClient app={app} userRole={user.role} />
    </div>
  );
}
