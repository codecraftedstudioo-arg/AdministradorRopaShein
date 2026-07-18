"use client";

import Link from "next/link";
import {
  CATEGORIA_LABELS,
  type CategoriaValor,
} from "@shein/shared";
import { Card } from "@/components/ui";
import { EstadoBadge } from "./EstadoBadge";
import { Thumbnail } from "./Thumbnail";
import { ProductActions } from "./ProductActions";
import { formatMoney } from "@/lib/utils";
import type { PrendaListaDTO } from "@/types/inventory";

export function ProductGrid({ items }: { items: PrendaListaDTO[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((p) => (
        <Card key={p.id} hover className="overflow-hidden">
          <Link
            href={`/inventario/prendas/${p.id}`}
            className="block aspect-square"
          >
            <Thumbnail
              src={p.imagenPrincipal}
              alt={p.nombre}
              className="h-full w-full"
            />
          </Link>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`/inventario/prendas/${p.id}`}
                  className="block truncate font-medium hover:underline"
                >
                  {p.nombre}
                </Link>
                <p className="mt-0.5 font-mono text-xs text-muted">
                  {p.codigoInterno} · {p.lote}
                </p>
              </div>
              <ProductActions prenda={p} />
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted">
                {CATEGORIA_LABELS[p.categoria as CategoriaValor] ?? p.categoria}
                {" · "}
                {p.talle}
              </span>
              <EstadoBadge estado={p.estado} />
            </div>

            <p className="mt-2 text-lg font-semibold tracking-tight">
              {formatMoney(p.precioVenta)}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
