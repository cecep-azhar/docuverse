import { db } from "@/lib/db";
import { apps, pages, users } from "@/lib/schema";
import { StatsCard } from "@/components/admin/stats-card";
import { 
  FileText, 
  FolderKanban, 
  Users as UsersIcon, 
  Eye,
  TrendingUp,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { sql } from "drizzle-orm";
import { CreateAppDialog } from "@/components/create-app-dialog";
import { DeleteAppButton } from "@/components/delete-app-button";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getStats() {
  try {
    const [appsCount, pagesCount, usersCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(apps),
      db.select({ count: sql<number>`count(*)` }).from(pages),
      db.select({ count: sql<number>`count(*)` }).from(users),
    ]);

    const allApps = await db.select().from(apps).limit(5);

    return {
      totalApps: Number(appsCount[0]?.count || 0),
      totalPages: Number(pagesCount[0]?.count || 0),
      totalUsers: Number(usersCount[0]?.count || 0),
      recentApps: allApps,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      totalApps: 0,
      totalPages: 0,
      totalUsers: 0,
      recentApps: [],
    };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Ringkasan aktivitas dan statistik
          </p>
        </div>
        <CreateAppDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Aplikasi"
          value={stats.totalApps}
          description="Jumlah aplikasi terdaftar"
          icon={FolderKanban}
        />
        <StatsCard
          title="Total Halaman"
          value={stats.totalPages}
          description="Jumlah halaman dokumentasi"
          icon={FileText}
        />
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          description="Jumlah users terdaftar"
          icon={UsersIcon}
        />
        <StatsCard
          title="Total Views"
          value="0"
          description="Total kunjungan halaman"
          icon={Eye}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Aplikasi Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentApps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Belum ada aplikasi</p>
                <CreateAppDialog />
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentApps.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    {app.logoUrl ? (
                      <img
                        src={app.logoUrl}
                        alt={app.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                        <FolderKanban className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{app.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        /{app.slug}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <DeleteAppButton appId={app.id} appName={app.name} />
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/dashboard/apps/${app.id}`}>
                          Kelola
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Statistik Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Halaman Dibuat</span>
                <span className="font-semibold">{stats.totalPages}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Aplikasi Aktif</span>
                <span className="font-semibold">{stats.totalApps}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Views</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Diperbarui: {new Date().toLocaleDateString('id-ID', { 
                    day: 'numeric',
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground pt-8">
        Development by Software Engineering RND Gerlink {new Date().getFullYear()}
      </div>
    </div>
  );
}
