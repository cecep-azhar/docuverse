"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, FileText, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchDialogProps {
  appId: string;
  appSlug: string;
  versionSlug: string;
  languageCode: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  isFolder: boolean;
}

export function SearchDialog({
  appId,
  appSlug,
  versionSlug,
  languageCode,
  open,
  onOpenChange,
}: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const searchPages = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?appId=${appId}&query=${encodeURIComponent(query)}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchPages, 300);
    return () => clearTimeout(debounce);
  }, [query, appId]);

  const handleSelectResult = (result: SearchResult) => {
    router.push(`/${appSlug}/${versionSlug}/${languageCode}/${result.slug}`);
    onOpenChange(false);
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search Documentation</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b pb-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {query.length < 2
                ? "Type at least 2 characters to search"
                : "No results found"}
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((result) => (
                <Button
                  key={result.id}
                  variant="ghost"
                  className="w-full justify-start gap-3 h-auto py-3 px-4"
                  onClick={() => handleSelectResult(result)}
                >
                  {result.isFolder ? (
                    <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 text-left">
                    <div className="font-medium">{result.title}</div>
                    {result.content && (
                      <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {result.content.replace(/<[^>]*>/g, "").substring(0, 100)}...
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
