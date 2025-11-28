import { db } from "@/lib/db";
import { apps, pages, versions, languages } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreatePageDialog } from "@/components/create-page-dialog";
import { EditPageDialog } from "@/components/edit-page-dialog";
import { DeletePageButton } from "@/components/delete-page-button";
import { VersionSwitcher } from "@/components/version-switcher";
import { LanguageSwitcher } from "@/components/language-switcher";
import { FileText, Folder } from "lucide-react";

export default async function AppDashboardPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ appId: string }>;
  searchParams: Promise<{ version?: string; language?: string }>;
}) {
  const { appId } = await params;
  const searchParamsResolved = await searchParams;
  
  const app = await db.query.apps.findFirst({
    where: eq(apps.id, appId),
    with: {
        versions: true,
        languages: true,
    }
  });

  if (!app) {
    notFound();
  }

  // Get default version and language
  let defaultVersion = app.versions.find(v => v.isDefault) || app.versions[0];
  let defaultLanguage = app.languages.find(l => l.isDefault) || app.languages[0];

  // Override with query params if provided
  const selectedVersion = searchParamsResolved.version 
    ? app.versions.find(v => v.id === searchParamsResolved.version) || defaultVersion
    : defaultVersion;
  const selectedLanguage = searchParamsResolved.language
    ? app.languages.find(l => l.id === searchParamsResolved.language) || defaultLanguage
    : defaultLanguage;

  if (!selectedVersion || !selectedLanguage) {
      return <div>App setup incomplete. Please add a version and language.</div>
  }

  const appPages = await db.query.pages.findMany({
      where: and(
          eq(pages.appId, app.id),
          eq(pages.versionId, selectedVersion.id),
          eq(pages.languageId, selectedLanguage.id)
      ),
      orderBy: (pages, { asc }) => [asc(pages.order)],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">{app.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <VersionSwitcher versions={app.versions} currentVersionId={selectedVersion.id} />
              <LanguageSwitcher languages={app.languages} currentLanguageId={selectedLanguage.id} />
            </div>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">Settings</Button>
            <CreatePageDialog appId={app.id} versionId={selectedVersion.id} languageId={selectedLanguage.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
          <div className="border rounded-lg">
              <div className="p-4 border-b">
                  <h3 className="font-semibold">Pages</h3>
              </div>
              <div className="divide-y">
                  {appPages.map(page => (
                      <div key={page.id} className="p-4 hover:bg-accent/50 transition-colors flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                              {page.isFolder ? (
                                  <Folder className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                              )}
                              <div>
                                  <div className="font-medium">{page.title}</div>
                                  <div className="text-xs text-muted-foreground">/{page.slug}</div>
                              </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <EditPageDialog page={page} />
                              <DeletePageButton pageId={page.id} pageTitle={page.title} />
                          </div>
                      </div>
                  ))}
                  {appPages.length === 0 && (
                      <div className="p-8 text-center text-sm text-muted-foreground">
                          No pages yet. Click &quot;New Page&quot; to get started.
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
}
