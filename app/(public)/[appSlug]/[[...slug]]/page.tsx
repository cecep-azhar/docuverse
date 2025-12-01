import { db } from "@/lib/db";
import { apps, pages, versions, languages } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, Search, ChevronRight, ChevronDown, Home, BookOpen } from "lucide-react";
import { MDXRemote } from 'next-mdx-remote/rsc';
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchButton } from "@/components/search-button";

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

export default async function PublicPage({ params }: { params: Promise<{ appSlug: string, slug?: string[] }> }) {
  const { appSlug, slug = [] } = await params;

  const app = await db.query.apps.findFirst({
    where: eq(apps.slug, appSlug),
    with: {
        versions: true,
        languages: true,
    }
  });

  if (!app) notFound();

  // Get defaults
  const defaultVersion = app.versions.find(v => v.isDefault) || app.versions[0];
  const defaultLanguage = app.languages.find(l => l.isDefault) || app.languages[0];

  if (!defaultVersion || !defaultLanguage) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl font-bold">Configuration Error</h1>
        <p className="text-muted-foreground mt-2">
          This app doesn't have a default version or language configured.
        </p>
      </div>
    );
  }

  // Simple routing logic:
  // /:appSlug -> default version, default lang
  // /:appSlug/:versionSlug -> specific version, default lang
  // /:appSlug/:versionSlug/:langCode -> specific version, specific lang
  // /:appSlug/:versionSlug/:langCode/...path -> specific version, lang, and page path

  let version = defaultVersion;
  let language = defaultLanguage;
  let pagePath: string[] = [];

  // Try to match version from first slug segment
  if (slug.length > 0) {
    const versionMatch = app.versions.find(v => v.slug === slug[0]);
    if (versionMatch) {
      version = versionMatch;
      
      // Try to match language from second segment
      if (slug.length > 1) {
        const languageMatch = app.languages.find(l => l.code === slug[1]);
        if (languageMatch) {
          language = languageMatch;
          pagePath = slug.slice(2); // Rest is page path
        } else {
          // Second segment is not a language, so it's part of page path
          pagePath = slug.slice(1);
        }
      }
    } else {
      // First segment is not a version, treat entire slug as page path
      pagePath = slug;
    }
  }

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
                    <div className="mr-4 flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors" title="Back to Home">
                            <Home className="h-5 w-5" />
                        </Link>
                        <Link href={`/${appSlug}`} className="flex items-center space-x-2">
                            {app.logoUrl ? (
                                <img src={app.logoUrl} alt={app.name} className="h-6 w-6" />
                            ) : (
                                <BookOpen className="h-6 w-6" />
                            )}
                            <span className="hidden font-bold sm:inline-block">{app.name}</span>
                        </Link>
                    </div>
                    <div className="ml-auto">
                        <ThemeToggle />
                    </div>
                </div>
            </header>
            <main className="container py-6">
                <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
                <p className="mt-2 text-muted-foreground">The page you're looking for doesn't exist.</p>
            </main>
        </div>
      )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
            <div className="mr-4 flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors" title="Back to Home">
                    <Home className="h-5 w-5" />
                </Link>
                <Link href={`/${appSlug}`} className="flex items-center space-x-2">
                    {app.logoUrl ? (
                        <img src={app.logoUrl} alt={app.name} className="h-6 w-6" />
                    ) : (
                        <BookOpen className="h-6 w-6" />
                    )}
                    <span className="hidden font-bold sm:inline-block">{app.name}</span>
                </Link>
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    <span className="text-muted-foreground">v{version.name}</span>
                </nav>
            </div>
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                <div className="w-full flex-1 md:w-auto md:flex-none">
                    <SearchButton
                        appId={app.id}
                        appSlug={appSlug}
                        versionSlug={version.slug}
                        languageCode={language.code}
                    />
                </div>
                <ThemeToggle />
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
                        {currentPage.content ? (
                            <div 
                                className="[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_.youtube-video]:w-full [&_.youtube-video]:aspect-video [&_.youtube-video]:rounded-lg [&_a]:text-blue-500 [&_a]:underline [&_a]:hover:text-blue-700"
                                dangerouslySetInnerHTML={{ __html: currentPage.content }}
                            />
                        ) : (
                            <p className="text-muted-foreground">No content available.</p>
                        )}
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
