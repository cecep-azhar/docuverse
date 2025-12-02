import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { apps } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { CreateAppDialog } from "@/components/create-app-dialog";
import { DeleteAppButton } from "@/components/delete-app-button";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  let allApps: typeof apps.$inferSelect[] = [];
  
  try {
    allApps = await db.select().from(apps).orderBy(desc(apps.updatedAt));
  } catch (error) {
    console.error("Database error:", error);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Applications</h2>
            <p className="text-muted-foreground">Manage your documentation sites.</p>
        </div>
        <CreateAppDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allApps.map((app) => (
            <div key={app.id} className="group relative flex flex-col gap-2 rounded-lg border p-6 hover:bg-accent transition-colors">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold hover:text-primary transition-colors flex-1">{app.name}</h3>
                    <div className="flex items-center gap-1 relative z-10">
                        <DeleteAppButton appId={app.id} appName={app.name} />
                        <Link 
                            href={`/admin/dashboard/apps/${app.id}`}
                            className="p-1"
                        >
                            <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                    </div>
                </div>
                <Link 
                    href={`/admin/dashboard/apps/${app.id}`} 
                    className="flex-1 cursor-pointer"
                >
                    <p className="text-sm text-muted-foreground line-clamp-2">{app.description || "No description"}</p>
                    <div className="mt-auto pt-4 text-xs text-muted-foreground">
                        /{app.slug}
                    </div>
                </Link>
            </div>
        ))}
        {allApps.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <LayoutDashboard className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No apps created</h3>
                <p className="text-sm text-muted-foreground">Get started by creating your first documentation app.</p>
                <CreateAppDialog />
            </div>
        )}
      </div>
    </div>
  );
}

function LayoutDashboard(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    )
  }
