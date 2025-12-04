"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { slugify } from "@/lib/utils";
import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("@/app/admin/dashboard/apps/[appId]/components/editor"),
  { 
    ssr: false,
    loading: () => <div className="border rounded-md p-4 min-h-[400px] flex items-center justify-center text-muted-foreground">Loading editor...</div>
  }
);

interface CreatePageDialogProps {
  appId: string;
  versionId: string;
  languageId: string;
}

export function CreatePageDialog({ appId, versionId, languageId }: CreatePageDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const slug = slugify(title);

    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId,
          versionId,
          languageId,
          title,
          slug,
          content,
          order: parseInt(formData.get("order") as string) || 0,
          isFolder: false,
        }),
      });

      if (res.ok) {
        setOpen(false);
        setContent("");
        router.refresh();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create page");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Page
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
            <DialogDescription>
              Add a new page to your documentation with rich text formatting, images, links, and YouTube videos.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Getting Started"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                name="order"
                type="number"
                min="0"
                defaultValue="0"
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Determines the order in which pages appear in the sidebar (0 = first)
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Editor content={content} onChange={setContent} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Page"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
