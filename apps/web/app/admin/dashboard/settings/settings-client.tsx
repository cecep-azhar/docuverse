"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@docuverse/ui/button";
import { Input } from "@docuverse/ui/input";
import { Label } from "@docuverse/ui/label";
import { Textarea } from "@docuverse/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@docuverse/ui/card";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [brandDescription, setBrandDescription] = useState("");
  const [brandLogo, setBrandLogo] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setBrandName(data.brandName || "");
        setBrandDescription(data.brandDescription || "");
        setBrandLogo(data.brandLogo || "");
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          brandDescription,
          brandLogo,
        }),
      });

      if (res.ok) {
        alert("Settings saved successfully!");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your branding and site settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brand Settings</CardTitle>
          <CardDescription>
            Customize your landing page branding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="brandName">Brand Name</Label>
              <Input
                id="brandName"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Docuverse"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandDescription">Brand Description</Label>
              <Textarea
                id="brandDescription"
                value={brandDescription}
                onChange={(e) => setBrandDescription(e.target.value)}
                placeholder="Open source documentation platform..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandLogo">Brand Logo URL</Label>
              <Input
                id="brandLogo"
                value={brandLogo}
                onChange={(e) => setBrandLogo(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              {brandLogo && (
                <div className="mt-2">
                  <img src={brandLogo} alt="Logo preview" className="h-12 w-12 rounded object-cover" />
                </div>
              )}
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

