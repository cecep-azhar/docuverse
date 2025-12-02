"use client";

import { useState } from "react";
import { FileText, Folder } from "lucide-react";
import { EditPageDialog } from "@/components/edit-page-dialog";
import { DeletePageButton } from "@/components/delete-page-button";

interface PageListProps {
  pages: Array<{
    id: string;
    title: string;
    slug: string;
    content: string | null;
    isFolder: boolean;
  }>;
}

export function PageList({ pages }: PageListProps) {
  return (
    <div className="divide-y">
      {pages.map(page => (
        <div key={page.id} className="group relative">
          <div className="p-4 hover:bg-accent/50 transition-colors flex items-center justify-between cursor-pointer"
               onClick={(e) => {
                 // Only trigger if not clicking on action buttons
                 if (!(e.target as HTMLElement).closest('[data-action-button]')) {
                   const button = document.querySelector(`[data-edit-trigger="${page.id}"]`) as HTMLElement;
                   button?.click();
                 }
               }}>
            <div className="flex items-center gap-3 flex-1">
              {page.isFolder ? (
                <Folder className="h-4 w-4 text-muted-foreground" />
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <div className="font-medium">{page.title}</div>
                <div className="text-xs text-muted-foreground">/{page.slug}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity" data-action-button>
              <div data-edit-trigger={page.id}>
                <EditPageDialog page={page} />
              </div>
              <DeletePageButton pageId={page.id} pageTitle={page.title} />
            </div>
          </div>
        </div>
      ))}
      {pages.length === 0 && (
        <div className="p-8 text-center text-sm text-muted-foreground">
          No pages yet. Click &quot;New Page&quot; to get started.
        </div>
      )}
    </div>
  );
}
