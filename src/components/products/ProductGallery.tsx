"use client";

import * as React from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
}: {
  images: { url: string; isPrimary: boolean }[];
  name: string;
}) {
  const ordered = React.useMemo(
    () => [...images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary)),
    [images],
  );
  const [active, setActive] = React.useState(0);

  if (ordered.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-surface-2 text-muted">
        <ImageIcon className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-square overflow-hidden rounded-2xl border border-[var(--border)] bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ordered[active].url}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
      {ordered.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {ordered.map((img, idx) => (
            <button
              key={img.url + idx}
              onClick={() => setActive(idx)}
              className={cn(
                "aspect-square overflow-hidden rounded-lg border transition-all",
                active === idx
                  ? "border-[var(--ring)] ring-2 ring-ring/30"
                  : "border-[var(--border)] opacity-70 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
