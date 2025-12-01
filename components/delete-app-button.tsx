"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";

interface DeleteAppButtonProps {
  appId: string;
  appName: string;
}

export function DeleteAppButton({ appId, appName }: DeleteAppButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    console.log("[DELETE APP] Starting delete for appId:", appId);
    
    try {
      const url = `/api/apps?id=${appId}`;
      console.log("[DELETE APP] Fetching:", url);
      
      const res = await fetch(url, {
        method: "DELETE",
      });

      console.log("[DELETE APP] Response status:", res.status);

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("[DELETE APP] Delete failed:", error);
        alert(`Failed to delete app: ${error.error || "Unknown error"}`);
        return;
      }

      const data = await res.json();
      console.log("[DELETE APP] Response data:", data);
      
      if (data.success) {
        console.log("[DELETE APP] Success! Redirecting to dashboard...");
        setOpen(false);
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        console.error("[DELETE APP] Success flag false:", data);
        alert(`Delete failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("[DELETE APP] Error deleting app:", error);
      alert(`Error deleting app: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div onClick={(e: React.MouseEvent) => {
      console.log("[DELETE APP] Wrapper clicked, stopping propagation");
      e.stopPropagation();
    }}>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <button
            aria-label="Delete application"
            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={(e: React.MouseEvent) => {
              console.log("[DELETE APP] Button clicked, opening dialog");
              e.stopPropagation();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </AlertDialogTrigger>
      <AlertDialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Application</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{appName}</strong>?
            <br />
            <br />
            This will permanently delete the app and all its versions, languages,
            and pages. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </div>
  );
}
