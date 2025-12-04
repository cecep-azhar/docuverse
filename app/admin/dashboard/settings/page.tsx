import { getCurrentUser, canManageSettings } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import SettingsPageClient from "./settings-client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/admin");
  }

  const canManage = canManageSettings(currentUser.role);

  if (!canManage) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground mt-1">
            System settings dan konfigurasi
          </p>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">
              Hanya Super Admin yang dapat mengakses halaman settings
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <SettingsPageClient />;
}

