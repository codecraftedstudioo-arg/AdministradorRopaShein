"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  DollarSign,
  Archive,
  RotateCcw,
} from "lucide-react";
import type { ProductStatus } from "@prisma/client";
import { SellModal } from "./SellModal";
import { ConfirmDialog, useToast } from "@/components/ui";
import {
  archiveProductAction,
  restoreProductAction,
} from "@/app/(dashboard)/products/actions";

export function ProductRowActions({
  id,
  name,
  status,
  priceCents,
  currentUserName,
}: {
  id: string;
  name: string;
  status: ProductStatus;
  priceCents: number;
  currentUserName: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [sellOpen, setSellOpen] = React.useState(false);
  const [archiveOpen, setArchiveOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const canSell = status === "AVAILABLE" || status === "RESERVED";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.preventDefault();
          setOpen((o) => !o);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="card-surface animate-scale-in absolute right-0 z-20 mt-1 w-44 overflow-hidden p-1.5">
          <Link
            href={`/products/${id}`}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
          >
            <Eye className="h-4 w-4 text-muted" /> Ver ficha
          </Link>
          <Link
            href={`/products/${id}/edit`}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
          >
            <Pencil className="h-4 w-4 text-muted" /> Editar
          </Link>
          {canSell && (
            <button
              onClick={() => {
                setOpen(false);
                setSellOpen(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
            >
              <DollarSign className="h-4 w-4 text-muted" /> Vender
            </button>
          )}
          {status === "ARCHIVED" ? (
            <button
              onClick={async () => {
                setOpen(false);
                await restoreProductAction(id);
                toast("Prenda restaurada", "success");
                router.refresh();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-surface-2"
            >
              <RotateCcw className="h-4 w-4 text-muted" /> Restaurar
            </button>
          ) : (
            <button
              onClick={() => {
                setOpen(false);
                setArchiveOpen(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-500/10 dark:text-red-400"
            >
              <Archive className="h-4 w-4" /> Archivar
            </button>
          )}
        </div>
      )}

      <SellModal
        open={sellOpen}
        onClose={() => setSellOpen(false)}
        productId={id}
        productName={name}
        defaultPriceCents={priceCents}
        currentUserName={currentUserName}
      />
      <ConfirmDialog
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        onConfirm={async () => {
          await archiveProductAction(id);
          toast("Prenda archivada", "success");
          router.refresh();
        }}
        title="Archivar prenda"
        description={`¿Archivar "${name}"? No se elimina, se conserva en el archivo con todo su historial.`}
        confirmLabel="Archivar"
        variant="danger"
      />
    </div>
  );
}
