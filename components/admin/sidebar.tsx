"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  LogOut,
  FileText,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/app/admin/actions";

interface SidebarProps {
  isMobile?: boolean;
  brandName?: string;
  brandLogo?: string | null;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Aplikasi",
    href: "/admin/dashboard/apps",
    icon: FolderKanban,
  },
  {
    name: "Halaman",
    href: "/admin/dashboard/pages",
    icon: FileText,
  },
  {
    name: "Users",
    href: "/admin/dashboard/users",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/admin/dashboard/settings",
    icon: Settings,
  },
];

export default function Sidebar({ isMobile = false, brandName = "Docuverse", brandLogo = null }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          {brandLogo ? (
            <img src={brandLogo} alt={brandName} className="h-8 w-8 rounded-lg object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                {brandName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-xl">{brandName}</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.name} href={item.href} prefetch={false}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive && "bg-secondary font-medium"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3">
        <form action={logoutAction}>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            type="submit"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col h-full w-full bg-background">
        {sidebarContent}
      </div>
    );
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-background hidden sm:flex flex-col">
      {sidebarContent}
    </aside>
  );
}
