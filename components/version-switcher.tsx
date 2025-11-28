"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VersionSwitcherProps {
  versions: Array<{ id: string; slug: string; name: string; isDefault: boolean }>;
  currentVersionId: string;
}

export function VersionSwitcher({ versions, currentVersionId }: VersionSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (versionId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("version", versionId);
    router.push(`?${params.toString()}`);
  };

  return (
    <Select value={currentVersionId} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {versions.map((version) => (
          <SelectItem key={version.id} value={version.id}>
            {version.name} {version.isDefault && "(default)"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
