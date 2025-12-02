import { db } from "@/lib/db";
import { pages, apps, versions, languages } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, FolderKanban } from "lucide-react";
import Link from "next/link";
import { DeletePageButton } from "@/components/delete-page-button";
import { getCurrentUser, canDelete } from "@/lib/permissions";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getAllPages() {
  const allPages = await db
    .select({
      page: pages,
      app: apps,
      version: versions,
      language: languages,
    })
    .from(pages)
    .leftJoin(apps, eq(pages.appId, apps.id))
    .leftJoin(versions, eq(pages.versionId, versions.id))
    .leftJoin(languages, eq(pages.languageId, languages.id))
    .orderBy(pages.createdAt);

  return allPages;
}

export default async function PagesPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/admin");
  }

  const allPages = await getAllPages();
  const allApps = await db.select().from(apps);
  const canDeletePages = canDelete(currentUser.role);

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Halaman</h2>
          <p className="text-muted-foreground mt-1">
            Kelola semua halaman dokumentasi
          </p>
        </div>
        {allApps.length > 0 && (
          <Button asChild>
            <Link href="/admin/dashboard/apps">
              <FolderKanban className="h-4 w-4 mr-2" />
              Kelola Aplikasi
            </Link>
          </Button>
        )}
      </div>

      {allPages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Belum ada halaman</h3>
            <p className="text-muted-foreground mb-6 text-center">
              {allApps.length === 0 
                ? "Buat aplikasi terlebih dahulu sebelum menambah halaman"
                : "Buka halaman aplikasi untuk menambah halaman baru"
              }
            </p>
            <Button asChild>
              <Link href="/admin/dashboard/apps">
                Ke Halaman Aplikasi
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {allPages.map(({ page, app, version, language }) => (
            <Card key={page.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl">{page.title}</CardTitle>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{app?.name || 'Unknown App'}</span>
                      <span>•</span>
                      <code className="bg-muted px-2 py-0.5 rounded text-xs">
                        /{app?.slug}/{version?.name || version?.id}/{language?.code}/{page.slug}
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/${app?.slug}/${version?.name || version?.id}/${language?.code}/${page.slug}`}
                        target="_blank"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeletePageButton pageId={page.id} pageTitle={page.title} />
                  </div>
                </div>
              </CardHeader>
              {page.content && (
                <CardContent>
                  <div className="text-sm text-muted-foreground line-clamp-3 prose prose-sm max-w-none">
                    {page.content.substring(0, 200)}...
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
