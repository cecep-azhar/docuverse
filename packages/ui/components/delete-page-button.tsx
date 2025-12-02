"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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

interface DeletePageButtonProps {
  pageId: string;
  pageTitle?: string;
}

export function DeletePageButton({ pageId, pageTitle = "this page" }: DeletePageButtonProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    console.log("[DELETE PAGE] Starting delete for pageId:", pageId);
    
    try {
      const url = `/api/pages?id=${pageId}`;
      console.log("[DELETE PAGE] Fetching:", url);
      
      const res = await fetch(url, {
        method: "DELETE",
      });

      console.log("[DELETE PAGE] Response status:", res.status);

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("[DELETE PAGE] Delete failed:", error);
        alert(`Failed to delete page: ${error.error || "Unknown error"}`);
        return;
      }

      const data = await res.json();
      console.log("[DELETE PAGE] Response data:", data);
      
      if (data.success) {
        console.log("[DELETE PAGE] Success! Refreshing...");
        setOpen(false);
        router.refresh();
      } else {
        console.error("[DELETE PAGE] Success flag false:", data);
        alert(`Delete failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("[DELETE PAGE] Error deleting page:", error);
      alert(`Error deleting page: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Page</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{pageTitle}</strong>?
            <br />
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
