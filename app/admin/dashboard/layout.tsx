import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Sidebar from "@/components/admin/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getCurrentUser } from "@/lib/permissions";
import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settingsData = await getSettings();
  
  return {
    title: `Admin - ${settingsData.brandName}`,
    description: settingsData.brandDescription || `Admin dashboard for ${settingsData.brandName}`,
    icons: {
      icon: settingsData.brandLogo || "/favicon.ico",
    },
  };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session) {
    redirect("/admin");
  }

  const currentUser = await getCurrentUser();
  const userName = currentUser?.name || currentUser?.email?.split('@')[0] || 'Admin';
  
  const settingsData = await getSettings();

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar brandName={settingsData.brandName} brandLogo={settingsData.brandLogo} />
      <div className="flex flex-1 flex-col sm:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <Sidebar isMobile brandName={settingsData.brandName} brandLogo={settingsData.brandLogo} />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg sm:text-xl font-semibold">Hi, {userName}</h1>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
        <footer className="border-t py-4 px-4 sm:px-6">
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            Development by Software Engineering RND Gerlink 2025
          </p>
        </footer>
      </div>
    </div>
  );
}

