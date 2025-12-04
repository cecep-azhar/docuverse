"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AppSettingsClientProps {
  app: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logoUrl: string | null;
  };
  userRole: string;
}

export default function AppSettingsClient({ app, userRole }: AppSettingsClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: app.name,
    slug: app.slug,
    description: app.description || "",
    logoUrl: app.logoUrl || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/apps", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: app.id,
          ...formData,
        }),
      });

      if (res.ok) {
        router.refresh();
        alert("Settings updated successfully!");
      } else {
        alert("Failed to update settings");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const res = await fetch("/api/apps", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: app.id }),
      });

      if (res.ok) {
        router.push("/admin/dashboard/apps");
        router.refresh();
      } else {
        alert("Failed to delete application");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit} className="border rounded-lg p-6">
        <h3 className="font-semibold mb-4">General Settings</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">App Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              placeholder="my-app"
            />
            <p className="text-sm text-muted-foreground mt-1">
              URL: /{formData.slug}
            </p>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of your app"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              type="url"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
            {formData.logoUrl && (
              <div className="mt-2">
                <img
                  src={formData.logoUrl}
                  alt="Logo preview"
                  className="h-12 w-12 object-contain border rounded"
                />
              </div>
            )}
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>

      {userRole === "super_admin" && (
        <div className="border border-red-200 rounded-lg p-6 bg-red-50 dark:bg-red-950/10">
          <h3 className="font-semibold mb-2 text-red-900 dark:text-red-100">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Settings that can permanently affect your application. This action cannot be undone.
          </p>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Application"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the application <strong>{app.name}</strong> and all of its data including:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>All versions</li>
                    <li>All languages</li>
                    <li>All pages and content</li>
                    <li>All analytics data</li>
                  </ul>
                  <br />
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, delete application
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
