"use client";

import * as React from "react";
import { UploadCloud, Star, X, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import type { ImagenDTO } from "@/types/inventory";

export function ImageUploader({
  value,
  onChange,
}: {
  value: ImagenDTO[];
  onChange: (imagenes: ImagenDTO[]) => void;
}) {
  const { toast } = useToast();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [subiendo, setSubiendo] = React.useState(false);

  const reindexar = (imgs: ImagenDTO[]): ImagenDTO[] => {
    const conPrincipal = imgs.some((i) => i.esPrincipal);
    return imgs.map((img, i) => ({
      ...img,
      orden: i,
      esPrincipal: conPrincipal ? img.esPrincipal : i === 0,
    }));
  };

  const subir = async (files: FileList | File[]) => {
    const lista = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (lista.length === 0) return;

    setSubiendo(true);
    try {
      const fd = new FormData();
      lista.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al subir");

      const nuevas: ImagenDTO[] = (data.urls as string[]).map((url, i) => ({
        url,
        orden: value.length + i,
        esPrincipal: false,
      }));
      onChange(reindexar([...value, ...nuevas]));
    } catch (e) {
      toast(e instanceof Error ? e.message : "Error al subir imágenes", "error");
    } finally {
      setSubiendo(false);
    }
  };

  const eliminar = (index: number) =>
    onChange(reindexar(value.filter((_, i) => i !== index)));

  const hacerPrincipal = (index: number) =>
    onChange(value.map((img, i) => ({ ...img, esPrincipal: i === index })));

  const mover = (index: number, dir: -1 | 1) => {
    const destino = index + dir;
    if (destino < 0 || destino >= value.length) return;
    const copia = [...value];
    [copia[index], copia[destino]] = [copia[destino], copia[index]];
    onChange(reindexar(copia));
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          subir(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-6 py-10 text-center transition-colors",
          dragging
            ? "border-[var(--ring)] bg-surface-2"
            : "border-[var(--border-strong)] hover:bg-surface-2",
        )}
      >
        {subiendo ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted" />
        ) : (
          <UploadCloud className="h-6 w-6 text-muted" />
        )}
        <p className="text-sm font-medium">
          Arrastrá imágenes o hacé clic para subir
        </p>
        <p className="text-xs text-muted">
          JPG, PNG, WEBP, GIF o AVIF · hasta 8 MB c/u
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) subir(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((img, i) => (
            <div
              key={img.url}
              className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--border)] bg-surface-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />

              {img.esPrincipal && (
                <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                  <Star className="h-3 w-3" />
                  Principal
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/50 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-1">
                  <IconBtn onClick={() => mover(i, -1)} disabled={i === 0}>
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </IconBtn>
                  <IconBtn
                    onClick={() => mover(i, 1)}
                    disabled={i === value.length - 1}
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </IconBtn>
                </div>
                <div className="flex gap-1">
                  <IconBtn
                    onClick={() => hacerPrincipal(i)}
                    title="Marcar como principal"
                  >
                    <Star
                      className={cn(
                        "h-3.5 w-3.5",
                        img.esPrincipal && "fill-current",
                      )}
                    />
                  </IconBtn>
                  <IconBtn onClick={() => eliminar(i)} title="Eliminar">
                    <X className="h-3.5 w-3.5" />
                  </IconBtn>
                </div>
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
      className="flex h-6 w-6 items-center justify-center rounded-md bg-white/15 text-white transition-colors hover:bg-white/30 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
