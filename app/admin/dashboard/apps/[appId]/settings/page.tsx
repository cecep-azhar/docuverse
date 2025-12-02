import { db } from "@/lib/db";
import { apps } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AppSettingsPage({ 
  params 
}: { 
  params: Promise<{ appId: string }>;
}) {
  const { appId } = await params;
  
  const app = await db.query.apps.findFirst({
    where: eq(apps.id, appId),
  });

  if (!app) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/dashboard/apps/${appId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">App Settings</h2>
          <p className="text-muted-foreground">{app.name}</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">App Name</label>
              <p className="text-sm text-muted-foreground mt-1">{app.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Slug</label>
              <p className="text-sm text-muted-foreground mt-1">/{app.slug}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <p className="text-sm text-muted-foreground mt-1">{app.description || "No description"}</p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Settings that can permanently affect your application.
          </p>
          <Button variant="destructive" disabled>
            Delete Application
          </Button>
        </div>
      </div>
    </div>
  );
}
