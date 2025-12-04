import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyPassword, getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

export default async function AdminLoginPage() {
  // Check if setup is needed
  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    redirect("/setup");
  }

  async function login(formData: FormData) {
    "use server";
    
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const user = await getUser(email);
    if (user && await verifyPassword(password, user.passwordHash)) {
        const cookieStore = await cookies();
        cookieStore.set("admin_session", user.id, { httpOnly: true, maxAge: 60 * 60 * 24 * 7 }); // 7 days
        redirect("/admin/dashboard");
    }
    
    // In a real app, handle error state
    redirect("/admin?error=invalid");
  }

  return (
    <div className="w-full max-w-sm p-6 bg-background rounded-lg border shadow-sm">
      <div className="flex flex-col space-y-2 text-center mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Login Admin</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>
      <form action={login} className="space-y-4">
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

