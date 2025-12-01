import { db } from "@/lib/db";
import { apps, settings } from "@/lib/schema";
import Link from "next/link";
import { BookOpen, ArrowRight, Github } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NetworkBackground } from "@/components/network-background";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const allApps = await db.select().from(apps);
  
  let brandSettings = await db.select().from(settings).limit(1);
  const brand = brandSettings[0] || {
    brandName: "Docuverse",
    brandDescription: "Open source documentation platform. Beautiful, fast, and easy to use.",
    brandLogo: null,
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <NetworkBackground />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent via-background/40 to-background/80" />

      <div className="relative z-10">
        <header className="sticky top-0 z-20">
          <div className="container flex h-16 items-center justify-between">
            <nav className="flex items-center gap-2">
              <ThemeToggle />
              {/* <Button asChild size="sm">
                <Link href="/admin">Open Admin</Link>
              </Button> */}
              {/* <Button asChild size="sm" variant="ghost">
                <Link href="https://github.com" target="_blank" aria-label="GitHub">
                  <Github className="h-4 w-4" />
                </Link>
              </Button> */}
            </nav>
          </div>
        </header>

        <main>
          <section className="container py-20 md:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-8 flex justify-center">
                {brand.brandLogo ? (
                  <div className="h-24 w-24 overflow-hidden rounded-xl border bg-white shadow-sm">
                    <img
                      src={brand.brandLogo}
                      alt={brand.brandName}
                      className="h-full w-full object-contain p-3"
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl border bg-white shadow-sm">
                    <BookOpen className="h-12 w-12 text-primary" />
                  </div>
                )}
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                {brand.brandName}
              </h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                {brand.brandDescription}
              </p>

              <div className="mt-8 flex items-center justify-center gap-3">
                <Button asChild size="lg">
                  <a href="#docs" aria-label="Browse documentation">Browse Docs</a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/admin">Create or Manage Docs</Link>
                </Button>
              </div>
            </div>
          </section>

          <section id="docs" className="container pb-20 md:pb-28">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Explore Documentation</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Select a product to view its docs.</p>
                </div>
                {allApps.length > 0 && (
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/admin">Manage</Link>
                  </Button>
                )}
              </div>

              {allApps.length === 0 ? (
                <Card className="p-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <BookOpen className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">No documentation yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Get started by creating your first app and pages in Admin.
                  </p>
                  <div className="mt-6 flex items-center justify-center">
                    <Button asChild>
                      <Link href="/admin">Open Admin</Link>
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {allApps.map((app) => (
                    <Link
                      key={app.id}
                      href={`/${app.slug}`}
                      aria-label={`Open ${app.name} documentation`}
                    >
                      <Card className="group h-full cursor-pointer p-6 transition-shadow hover:shadow-md">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {app.logoUrl ? (
                              <img
                                src={app.logoUrl}
                                alt={app.name}
                                className="h-10 w-10 rounded-md border object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-card">
                                <BookOpen className="h-5 w-5 text-primary" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-medium transition-colors group-hover:text-primary">
                                {app.name}
                              </h3>
                              <div className="mt-1 text-xs text-muted-foreground">Documentation</div>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                        </div>
                        <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
                          {app.description || "No description available"}
                        </p>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        <footer className="border-t bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container py-6">
            <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Powered by {brand.brandName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="https://github.com"
                  target="_blank"
                  className="transition-colors hover:text-foreground"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

