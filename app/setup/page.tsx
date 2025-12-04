import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { redirect } from "next/navigation";
import SetupForm from "./setup-form";
import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settingsData = await getSettings();
  
  return {
    title: `Setup - ${settingsData.brandName}`,
    description: settingsData.brandDescription || "Setup your first admin account",
    icons: {
      icon: settingsData.brandLogo || "/favicon.ico",
    },
  };
}

export default async function SetupPage() {
  // Check if any users exist
  const existingUsers = await db.select().from(users);
  
  // If users exist, redirect to admin
  if (existingUsers.length > 0) {
    redirect("/admin");
  }

  const settingsData = await getSettings();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Welcome to {settingsData.brandName}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Setup your first admin account
            </p>
          </div>
          
          <SetupForm />
        </div>
        
        <p className="text-center text-slate-400 text-sm mt-4">
          This is a one-time setup. You'll be automatically logged in after creation.
        </p>
      </div>
    </div>
  );
}
