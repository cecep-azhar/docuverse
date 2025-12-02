"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { SearchDialog } from "@/components/search-dialog";

interface SearchButtonProps {
  appId: string;
  appSlug: string;
  versionSlug: string;
  languageCode: string;
}

export function SearchButton({ appId, appSlug, versionSlug, languageCode }: SearchButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search documentation...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <SearchDialog
        appId={appId}
        appSlug={appSlug}
        versionSlug={versionSlug}
        languageCode={languageCode}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
