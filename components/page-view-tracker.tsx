"use client";

import { useEffect } from "react";

export default function PageViewTracker({ pageId }: { pageId: string }) {
  useEffect(() => {
    // Catat page view saat halaman dimuat
    const recordView = async () => {
      try {
        await fetch("/api/page-views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId }),
        });
      } catch (error) {
        console.error("Failed to record page view:", error);
      }
    };

    recordView();
  }, [pageId]);

  return null;
}
