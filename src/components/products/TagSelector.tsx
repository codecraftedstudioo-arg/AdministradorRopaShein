"use client";

import type { Tag } from "@prisma/client";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function TagSelector({
  tags,
  selected,
  onChange,
}: {
  tags: Tag[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const active = selected.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all",
              active
                ? "border-transparent bg-accent text-accent-foreground"
                : "border-[var(--border-strong)] text-muted hover:border-[var(--ring)] hover:text-foreground",
            )}
          >
            {active && <Check className="h-3.5 w-3.5" />}
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: tag.color ?? "#999" }}
            />
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
