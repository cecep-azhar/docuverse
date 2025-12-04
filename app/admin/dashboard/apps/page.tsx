import { db } from "@/lib/db";
import { apps } from "@/lib/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Plus, Settings, ExternalLink } from "lucide-react";
import Link from "next/link";
import { CreateAppDialog } from "@/components/create-app-dialog";
import { DeleteAppButton } from "@/components/delete-app-button";
import { getCurrentUser, canDelete } from "@/lib/permissions";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AppsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/admin");
  }

  const allApps = await db.select().from(apps).orderBy(apps.createdAt);
  const canDeleteApps = canDelete(currentUser.role);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Aplikasi</h2>
          <p className="text-muted-foreground mt-1">
            Kelola semua aplikasi dokumentasi
          </p>
        </div>
        <CreateAppDialog />
      </div>

      {allApps.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderKanban className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Belum ada aplikasi</h3>
            <p className="text-muted-foreground mb-6 text-center">
              Buat aplikasi dokumentasi pertama Anda untuk memulai
            </p>
            <CreateAppDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allApps.map((app) => (
            <Card key={app.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {app.logoUrl ? (
                      <img
                        src={app.logoUrl}
                        alt={app.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderKanban className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{app.name}</CardTitle>
                      <CardDescription className="text-xs">
                        /{app.slug}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {app.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {app.description}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Button variant="default" size="sm" asChild className="flex-1">
                    <Link href={`/admin/dashboard/apps/${app.id}`}>
                      <Settings className="h-4 w-4 mr-2" />
                      Kelola
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/${app.slug}`} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                  {canDeleteApps && <DeleteAppButton appId={app.id} appName={app.name} />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

