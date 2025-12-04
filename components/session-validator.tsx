"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function SessionValidator() {
  const router = useRouter();

  useEffect(() => {
    // Check session every 5 minutes
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/auth/validate", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          // Session invalid, redirect to login
          router.push("/admin");
        }
      } catch (error) {
        console.error("Session validation error:", error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [router]);

  return null;
}
