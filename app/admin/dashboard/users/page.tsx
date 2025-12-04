import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users as UsersIcon, Plus, Mail, Calendar, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser, canManageUsers } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { CreateUserDialog } from "@/components/create-user-dialog";
import { EditUserDialog } from "@/components/edit-user-dialog";
import { DeleteUserButton } from "@/components/delete-user-button";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function UsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/admin");
  }

  const canManage = canManageUsers(currentUser.role);
  const allUsers = await db.select().from(users);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground mt-1">
          Kelola semua pengguna admin
        </p>
      </div>
      {canManage && <CreateUserDialog />}
    </div>      {allUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UsersIcon className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Belum ada user</h3>
            <p className="text-muted-foreground mb-6 text-center">
              Tambahkan user admin untuk mengelola sistem
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UsersIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{user.name || 'No Name'}</CardTitle>
                      <CardDescription className="text-xs flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </CardDescription>
                    </div>
                  </div>
                  {canManage && currentUser.id !== user.id && (
                    <DeleteUserButton userId={user.id} userEmail={user.email} />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Badge variant={user.role === 'super_admin' ? 'default' : 'secondary'}>
                    {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </Badge>
                </div>
                {user.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Dibuat: {new Date(user.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                {canManage && (
                  <div className="pt-2 border-t">
                    <EditUserDialog user={user} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}

