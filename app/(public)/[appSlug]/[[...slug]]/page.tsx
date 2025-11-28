import { db } from "@/lib/db";
import { apps, pages, versions, languages } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, Search, ChevronRight, ChevronDown } from "lucide-react";
import { MDXRemote } from 'next-mdx-remote/rsc';

// Helper to recursively render sidebar
function SidebarItem({ page, currentSlug, depth = 0 }: { page: any, currentSlug: string, depth?: number }) {
    const isActive = page.slug === currentSlug;
    const hasChildren = page.children && page.children.length > 0;

    return (
        <div className="select-none">
            <Link 
                href={page.isFolder ? "#" : page.fullPath} 
                className={cn(
                    "flex items-center gap-2 py-1.5 px-2 rounded-md text-sm transition-colors",
                    isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    depth > 0 && "ml-4"
                )}
            >
                {hasChildren && (
                    <ChevronDown className="h-3 w-3" />
                )}
                {!hasChildren && page.isFolder && (
                    <ChevronRight className="h-3 w-3" />
                )}
                {page.title}
            </Link>
            {hasChildren && (
                <div className="mt-1">
                    {page.children.map((child: any) => (
                        <SidebarItem key={child.id} page={child} currentSlug={currentSlug} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default async function PublicPage({ params }: { params: { appSlug: string, slug?: string[] } }) {
  const { appSlug, slug = [] } = params;

  const app = await db.query.apps.findFirst({
    where: eq(apps.slug, appSlug),
    with: {
        versions: true,
        languages: true,
    }
  });

  if (!app) notFound();

  // Determine Version and Language
  // Logic:
  // /:appSlug -> default ver, default lang, home page
  // /:appSlug/:ver -> specific ver, default lang, home page
  // /:appSlug/:ver/:lang -> specific ver, specific lang, home page
  // /:appSlug/:ver/:lang/...path -> specific ver, specific lang, specific page

  let versionSlug = slug[0];
  let langCode = slug[1];
  let pagePath = slug.slice(2);

  let version = app.versions.find(v => v.slug === versionSlug);
  let language = app.languages.find(l => l.code === langCode);

  // Fallback logic
  if (!version) {
      // If first segment is not a version, maybe it's a page path in default version/lang?
      // But requirement says strict structure. Let's assume if not found, we try default.
      // Actually, for simplicity, let's assume strict routing or redirect.
      // If slug is empty, use defaults.
      if (slug.length === 0) {
          version = app.versions.find(v => v.isDefault) || app.versions[0];
          language = app.languages.find(l => l.isDefault) || app.languages[0];
      } else {
          // If slug has segments but first is not version, it might be a short url like /app/page-slug?
          // The requirement says: /:appSlug/:versionSlug/:langCode/path/to/page
          // Let's stick to defaults if not provided in URL, but we need to be careful about ambiguity.
          // For this MVP, let's assume if we can't match version/lang, we 404 or redirect.
          
          // Let's try to see if we can match defaults.
          const defaultVer = app.versions.find(v => v.isDefault) || app.versions[0];
          const defaultLang = app.languages.find(l => l.isDefault) || app.languages[0];
          
          // If we are at /appSlug, we use defaults.
          // If we are at /appSlug/v1, we use v1 and default lang.
          // If we are at /appSlug/v1/en, we use v1 and en.
          
          if (!version) {
             version = defaultVer;
             // If the first segment was NOT a version, then it must be part of the page path?
             // Or we just redirect to the full path?
             // Let's assume the user MUST provide version and lang if they are not defaults?
             // Or we treat the URL as:
             // If slug[0] matches a version, use it. Else use default version and treat slug[0] as part of path?
             // This is complex. Let's simplify:
             // If slug is empty -> Default Ver, Default Lang, Home Page.
             
             // If slug[0] is version:
             //    If slug[1] is lang:
             //       Path is slug[2...]
             //    Else:
             //       Lang is default. Path is slug[1...]
             // Else:
             //    Version is default. Lang is default. Path is slug[0...]
             
             version = app.versions.find(v => v.slug === slug[0]);
             if (version) {
                 language = app.languages.find(l => l.code === slug[1]);
                 if (language) {
                     pagePath = slug.slice(2);
                 } else {
                     language = defaultLang;
                     pagePath = slug.slice(1);
                 }
             } else {
                 version = defaultVer;
                 language = defaultLang;
                 pagePath = slug;
             }
          }
      }
  } else {
      // Version found
      if (!language) {
          // Check if second segment is language
           language = app.languages.find(l => l.code === slug[1]);
           if (language) {
               pagePath = slug.slice(2);
           } else {
               language = app.languages.find(l => l.isDefault) || app.languages[0];
               pagePath = slug.slice(1);
           }
      }
  }

  if (!version || !language) return <div>Configuration error</div>;

  // Fetch all pages for sidebar
  const allPages = await db.query.pages.findMany({
      where: and(
          eq(pages.appId, app.id),
          eq(pages.versionId, version.id),
          eq(pages.languageId, language.id)
      ),
      orderBy: (pages, { asc }) => [asc(pages.order)],
  });

  // Build Tree
  const pageMap = new Map();
  allPages.forEach(p => {
      pageMap.set(p.id, { ...p, children: [], fullPath: `/${appSlug}/${version!.slug}/${language!.code}/${p.slug}` });
  });
  const rootPages: any[] = [];
  allPages.forEach(p => {
      if (p.parentId) {
          const parent = pageMap.get(p.parentId);
          if (parent) parent.children.push(pageMap.get(p.id));
      } else {
          rootPages.push(pageMap.get(p.id));
      }
  });

  // Find current page
  // If pagePath is empty, find the page with order 0 or specific "home" slug?
  // Let's assume the first page is home if path is empty.
  let currentPage;
  if (pagePath.length === 0) {
      currentPage = rootPages[0]; // Simplification
  } else {
      // Find page by slug. Since we have nested slugs, we might need to traverse or store full slug.
      // For now, let's assume the last segment of pagePath matches the page slug.
      // This is not perfect for duplicate slugs in different folders, but works for simple cases.
      const targetSlug = pagePath[pagePath.length - 1];
      currentPage = allPages.find(p => p.slug === targetSlug);
  }

  if (!currentPage) {
      return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
                <div className="container flex h-14 items-center">
                    <div className="mr-4 hidden md:flex">
                        <Link href={`/${appSlug}`} className="mr-6 flex items-center space-x-2">
                            {app.logoUrl && <img src={app.logoUrl} className="h-6 w-6" />}
                            <span className="hidden font-bold sm:inline-block">{app.name}</span>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="container py-6">
                <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
            </main>
        </div>
      )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
            <div className="mr-4 hidden md:flex">
                <Link href={`/${appSlug}`} className="mr-6 flex items-center space-x-2">
                    {app.logoUrl && <img src={app.logoUrl} className="h-6 w-6" />}
                    <span className="hidden font-bold sm:inline-block">{app.name}</span>
                </Link>
                <nav className="flex items-center space-x-6 text-sm font-medium">
                    <span className="text-muted-foreground">v{version.name}</span>
                </nav>
            </div>
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                <div className="w-full flex-1 md:w-auto md:flex-none">
                    <Button variant="outline" className="relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64">
                        <span className="hidden lg:inline-flex">Search documentation...</span>
                        <span className="inline-flex lg:hidden">Search...</span>
                        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </Button>
                </div>
            </div>
        </div>
      </header>
      
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
            <div className="h-full py-6 pl-8 pr-6 lg:py-8">
                <div className="w-full space-y-4">
                    {rootPages.map(page => (
                        <SidebarItem key={page.id} page={page} currentSlug={currentPage.slug} />
                    ))}
                </div>
            </div>
        </aside>
        <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]">
            <div className="mx-auto w-full min-w-0">
                <div className="mb-4 flex items-center space-x-1 text-sm text-muted-foreground">
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                        Docs
                    </div>
                    <ChevronRight className="h-4 w-4" />
                    <div className="font-medium text-foreground">{currentPage.title}</div>
                </div>
                <div className="space-y-2">
                    <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">{currentPage.title}</h1>
                    <p className="text-lg text-muted-foreground">
                        {/* Description if any */}
                    </p>
                </div>
                <div className="pb-12 pt-8">
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                        <MDXRemote source={currentPage.content || ""} />
                    </div>
                </div>
            </div>
            <div className="hidden text-sm xl:block">
                <div className="sticky top-16 -mt-10 h-[calc(100vh-3.5rem)] overflow-hidden pt-6">
                    <div className="space-y-2">
                        <p className="font-medium">On this page</p>
                        <ul className="m-0 list-none">
                            {/* TOC would go here */}
                            <li><a href="#" className="inline-block py-1 text-muted-foreground hover:text-foreground">Top</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
}
