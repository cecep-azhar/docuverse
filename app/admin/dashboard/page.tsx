import { db } from "@/lib/db";
import { apps, pages, users, pageViews } from "@/lib/schema";
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
import StatsViewsChart from "@/components/admin/stats-views-chart";

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

async function getPageViewsStats() {
  try {
    const totalViewsRes = await db.select({ count: sql<number>`count(*)` }).from(pageViews);
    const totalViews = Number(totalViewsRes[0]?.count || 0);

    // Statistik harian (30 hari terakhir)
    const now = new Date();
    const days: string[] = [];
    const viewsPerDay: number[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const label = d.toLocaleString('default', { month: 'short', day: 'numeric' });
      days.push(label);
      
      const startOfDay = Math.floor(d.getTime() / 1000);
      const endOfDay = Math.floor((d.getTime() + 24 * 60 * 60 * 1000) / 1000);
      
      const res = await db.select({ count: sql<number>`count(*)` })
        .from(pageViews)
        .where(sql`viewed_at >= ${startOfDay} AND viewed_at < ${endOfDay}`);
      viewsPerDay.push(Number(res[0]?.count || 0));
    }

    // Statistik bulanan (12 bulan terakhir)
    const months: string[] = [];
    const viewsPerMonth: number[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      months.push(label);
      
      const startOfMonth = Math.floor(new Date(d.getFullYear(), d.getMonth(), 1).getTime() / 1000);
      const endOfMonth = Math.floor(new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime() / 1000);
      
      const res = await db.select({ count: sql<number>`count(*)` })
        .from(pageViews)
        .where(sql`viewed_at >= ${startOfMonth} AND viewed_at < ${endOfMonth}`);
      viewsPerMonth.push(Number(res[0]?.count || 0));
    }

    return { 
      totalViews, 
      dailyLabels: days, 
      dailyData: viewsPerDay,
      monthlyLabels: months,
      monthlyData: viewsPerMonth
    };
  } catch (error) {
    console.error("Error fetching page views stats:", error);
    // Return default empty stats if table doesn't exist
    const emptyDays = Array(30).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toLocaleString('default', { month: 'short', day: 'numeric' });
    });
    const emptyMonths = Array(12).fill(0).map((_, i) => {
      const d = new Date(new Date().getFullYear(), new Date().getMonth() - (11 - i), 1);
      return d.toLocaleString('default', { month: 'short', year: '2-digit' });
    });
    return {
      totalViews: 0,
      dailyLabels: emptyDays,
      dailyData: Array(30).fill(0),
      monthlyLabels: emptyMonths,
      monthlyData: Array(12).fill(0),
    };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();
  const viewsStats = await getPageViewsStats();

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dasbor</h2>
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
          title="Total Pengguna"
          value={stats.totalUsers}
          description="Jumlah pengguna terdaftar"
          icon={UsersIcon}
        />
        <StatsCard
          title="Total Pembaca"
          value={viewsStats.totalViews}
          description="Total kunjungan halaman"
          icon={Eye}
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Statistik Pembaca Sebulan Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatsViewsChart labels={viewsStats.dailyLabels} data={viewsStats.dailyData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Statistik Pembaca Setahun Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatsViewsChart labels={viewsStats.monthlyLabels} data={viewsStats.monthlyData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
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
              <div className="space-y-3">
                {stats.recentApps.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    {app.logoUrl ? (
                      <img
                        src={app.logoUrl}
                        alt={app.name}
                        className="h-9 w-9 rounded object-cover"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FolderKanban className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{app.name}</p>
                      <p className="text-xs text-muted-foreground truncate">/{app.slug}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/dashboard/apps/${app.id}`}>Kelola</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Ringkasan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Total Halaman</p>
                <p className="text-lg font-bold">{stats.totalPages}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Aplikasi Aktif</p>
                <p className="text-lg font-bold">{stats.totalApps}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Total Pembaca</p>
                <p className="text-lg font-bold">{viewsStats.totalViews}</p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Perbarui: {new Date().toLocaleDateString('id-ID', { 
                    day: 'numeric',
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

