"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSwitcherProps {
  languages: Array<{ id: string; code: string; name: string; isDefault: boolean }>;
  currentLanguageId: string;
}

export function LanguageSwitcher({ languages, currentLanguageId }: LanguageSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (languageId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("language", languageId);
    router.push(`?${params.toString()}`);
  };

  return (
    <Select value={currentLanguageId} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.id} value={language.id}>
            {language.name} {language.isDefault && "(default)"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
