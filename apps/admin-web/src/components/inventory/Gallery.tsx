"use client";

import * as React from "react";
import { Thumbnail } from "./Thumbnail";
import { cn } from "@/lib/utils";

export function Gallery({
  imagenes,
  alt,
}: {
  imagenes: { url: string }[];
  alt: string;
}) {
  const [idx, setIdx] = React.useState(0);
  const actual = imagenes[idx]?.url ?? null;

  return (
    <div className="flex flex-col gap-3">
      <div className="card-surface aspect-square overflow-hidden">
        <Thumbnail src={actual} alt={alt} className="h-full w-full" />
      </div>
      {imagenes.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {imagenes.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                "aspect-square overflow-hidden rounded-lg border transition-colors",
                i === idx
                  ? "border-[var(--ring)]"
                  : "border-[var(--border)] hover:border-[var(--border-strong)]",
              )}
            >
              <Thumbnail src={img.url} alt={alt} className="h-full w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
