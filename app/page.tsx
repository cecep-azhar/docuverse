import { db } from "@/lib/db";
import { apps, settings } from "@/lib/schema";
import Link from "next/link";
import { BookOpen, ArrowRight, Github } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NetworkBackground } from "@/components/network-background";

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
      {/* Network Background */}
      <NetworkBackground />
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-500/10 via-background to-blue-500/10 dark:from-purple-700/20 dark:via-background dark:to-blue-700/20 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-radial from-transparent via-background/50 to-background pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            {brand.brandLogo ? (
              <img src={brand.brandLogo} alt={brand.brandName} className="h-8 w-8" />
            ) : (
              <BookOpen className="h-6 w-6" />
            )}
            <span className="text-xl font-bold">{brand.brandName}</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link 
              href="/admin" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Centered Branding */}
      <section className="container py-24 md:py-32 lg:py-48">
        <div className="mx-auto max-w-4xl text-center">
          {/* Centered Brand Logo */}
          <div className="mb-8 flex justify-center">
            {brand.brandLogo ? (
              <div className="h-32 w-32 rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm border-2 border-primary/20 shadow-2xl shadow-primary/20 flex items-center justify-center">
                <img
                  src={brand.brandLogo}
                  alt={brand.brandName}
                  className="h-full w-full object-contain p-4"
                />
              </div>
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-primary/10 backdrop-blur-sm border-2 border-primary/20 shadow-2xl shadow-primary/20">
                <BookOpen className="h-16 w-16 text-primary" />
              </div>
            )}
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground">
            {brand.brandName}
          </h1>
          <p className="mt-6 text-xl text-muted-foreground sm:text-2xl max-w-2xl mx-auto">
            {brand.brandDescription}
          </p>
        </div>
      </section>

      {/* Documentation Grid */}
      <section className="container pb-24 md:pb-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Explore Documentation
            </h2>
            <p className="mt-3 text-muted-foreground">
              Choose a product to view its documentation
            </p>
          </div>

          {allApps.length === 0 ? (
            <div className="rounded-lg border border-dashed p-12 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No documentation yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Documentation will appear here once created.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {allApps.map((app) => (
                <Link
                  key={app.id}
                  href={`/${app.slug}`}
                  className="group relative overflow-hidden rounded-lg border bg-card/50 backdrop-blur-sm p-6 transition-all hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 hover:scale-105"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {app.logoUrl ? (
                        <img 
                          src={app.logoUrl} 
                          alt={app.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {app.name}
                        </h3>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                    {app.description || "No description available"}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      Documentation
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-md">
        <div className="container py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>Powered by {brand.brandName}</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="https://github.com" 
                target="_blank"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}

