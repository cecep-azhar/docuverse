import { db } from "@/lib/db";
import { apps, pages, versions, languages } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function AppDashboardPage({ params }: { params: { appId: string } }) {
  const app = await db.query.apps.findFirst({
    where: eq(apps.id, params.appId),
    with: {
        versions: true,
        languages: true,
    }
  });

  if (!app) {
    notFound();
  }

  // Get default version and language
  const defaultVersion = app.versions.find(v => v.isDefault) || app.versions[0];
  const defaultLanguage = app.languages.find(l => l.isDefault) || app.languages[0];

  if (!defaultVersion || !defaultLanguage) {
      return <div>App setup incomplete. Please add a version and language.</div>
  }

  const appPages = await db.query.pages.findMany({
      where: and(
          eq(pages.appId, app.id),
          eq(pages.versionId, defaultVersion.id),
          eq(pages.languageId, defaultLanguage.id)
      ),
      orderBy: (pages, { asc }) => [asc(pages.order)],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">{app.name}</h2>
            <p className="text-muted-foreground">
                {defaultVersion.name} • {defaultLanguage.name}
            </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">Settings</Button>
            <Button>
                <Plus className="mr-2 h-4 w-4" /> New Page
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          <div className="col-span-3 border rounded-lg p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Structure</h3>
              {/* Tree View Component Here */}
              <div className="space-y-1">
                  {appPages.map(page => (
                      <div key={page.id} className="p-2 hover:bg-accent rounded cursor-pointer text-sm">
                          {page.title}
                      </div>
                  ))}
                  {appPages.length === 0 && <div className="text-sm text-muted-foreground">No pages yet.</div>}
              </div>
          </div>
          <div className="col-span-9 border rounded-lg p-4">
              <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a page to edit
              </div>
          </div>
      </div>
    </div>
  );
}
