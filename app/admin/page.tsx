import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyPassword, getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { getSettings } from "@/lib/settings";
import { AlertCircle } from "lucide-react";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  // Check if setup is needed first
  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    redirect("/setup");
  }

  // Check if user is already logged in
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (session) {
    redirect("/admin/dashboard");
  }

  const settingsData = await getSettings();

  async function login(formData: FormData) {
    "use server";
    
    try {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      const user = await getUser(email);
      if (user && await verifyPassword(password, user.passwordHash)) {
          const cookieStore = await cookies();
          cookieStore.set("admin_session", user.id, { 
            httpOnly: true, 
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
            sameSite: "lax"
          }); // 7 days
          redirect("/admin/dashboard");
      }
      
      // Invalid credentials
      redirect("/admin?error=invalid");
    } catch (error) {
      // If error is from redirect(), throw it again
      if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
        throw error;
      }
      redirect("/admin?error=invalid");
    }
  }

  return (
    <div className="w-full max-w-sm p-6 bg-background rounded-lg border shadow-sm">
      <div className="flex flex-col space-y-2 text-center mb-6">
        {settingsData.brandLogo && (
          <div className="flex justify-center mb-4">
            <img 
              src={settingsData.brandLogo} 
              alt={settingsData.brandName}
              className="h-12 w-auto"
            />
          </div>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">Login Admin</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>
      <form action={login} className="space-y-4">
        {error === "invalid" && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-800 bg-red-50 dark:bg-red-950/30 dark:text-red-200 border border-red-200 dark:border-red-900 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p>Email atau password salah. Silakan coba lagi.</p>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>
    </div>
  );
}

