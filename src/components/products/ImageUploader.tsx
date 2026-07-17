"use client";

import * as React from "react";
import { UploadCloud, X, Star, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface ProductImageItem {
  url: string;
  isPrimary?: boolean;
}

export function ImageUploader({
  value,
  onChange,
}: {
  value: ProductImageItem[];
  onChange: (images: ProductImageItem[]) => void;
}) {
  const { toast } = useToast();
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir");
      const newImages: ProductImageItem[] = data.urls.map((url: string) => ({
        url,
      }));
      const merged = [...value, ...newImages];
      if (!merged.some((i) => i.isPrimary) && merged.length > 0) {
        merged[0].isPrimary = true;
      }
      onChange(merged);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Error al subir imágenes", "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (idx: number) => {
    const next = value.filter((_, i) => i !== idx);
    if (value[idx].isPrimary && next.length > 0) next[0].isPrimary = true;
    onChange(next);
  };

  const setPrimary = (idx: number) => {
    onChange(value.map((img, i) => ({ ...img, isPrimary: i === idx })));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border-strong)] bg-surface-2 px-6 py-10 text-center transition-colors hover:border-[var(--ring)]"
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted" />
        ) : (
          <UploadCloud className="h-6 w-6 text-muted" />
        )}
        <p className="text-sm font-medium text-foreground">
          {uploading ? "Subiendo..." : "Arrastrá o hacé clic para subir imágenes"}
        </p>
        <p className="text-xs text-muted">JPG, PNG, WEBP · hasta 8MB c/u</p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.map((img, idx) => (
            <div
              key={img.url + idx}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-xl border",
                img.isPrimary
                  ? "border-[var(--ring)] ring-2 ring-ring/30"
                  : "border-[var(--border)]",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="h-full w-full object-cover"
              />
              {img.isPrimary && (
                <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                  <Star className="h-2.5 w-2.5 fill-current" /> Principal
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <IconBtn onClick={() => move(idx, -1)} disabled={idx === 0}>
                  <ArrowLeft className="h-3.5 w-3.5" />
                </IconBtn>
                {!img.isPrimary && (
                  <IconBtn onClick={() => setPrimary(idx)} title="Marcar principal">
                    <Star className="h-3.5 w-3.5" />
                  </IconBtn>
                )}
                <IconBtn
                  onClick={() => move(idx, 1)}
                  disabled={idx === value.length - 1}
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </IconBtn>
                <IconBtn onClick={() => remove(idx)} title="Eliminar">
                  <X className="h-3.5 w-3.5" />
                </IconBtn>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-black transition-transform hover:scale-105 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
