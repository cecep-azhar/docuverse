import { db } from "@/lib/db";
import { apps, pages, versions, languages } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreatePageDialog } from "@/components/create-page-dialog";
import { VersionSwitcher } from "@/components/version-switcher";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ExternalLink, Settings } from "lucide-react";
import Link from "next/link";
import { PageList } from "./components/page-list";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
            <Link href={`/${app.slug}`} target="_blank">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Preview
              </Button>
            </Link>
            <Link href={`/admin/dashboard/apps/${app.id}/settings`}>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
            <CreatePageDialog appId={app.id} versionId={selectedVersion.id} languageId={selectedLanguage.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
          <div className="border rounded-lg">
              <div className="p-4 border-b">
                  <h3 className="font-semibold">Pages</h3>
              </div>
              <PageList pages={appPages} />
          </div>
      </div>
    </div>
  );
}
