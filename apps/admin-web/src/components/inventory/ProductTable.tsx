"use client";

import Link from "next/link";
import {
  CATEGORIA_LABELS,
  GENERO_LABELS,
  type CategoriaValor,
  type GeneroValor,
} from "@shein/shared";
import { EstadoBadge } from "./EstadoBadge";
import { Thumbnail } from "./Thumbnail";
import { ProductActions } from "./ProductActions";
import { formatMoney, formatDate } from "@/lib/utils";
import type { PrendaListaDTO } from "@/types/inventory";

export function ProductTable({ items }: { items: PrendaListaDTO[] }) {
  return (
    <div className="card-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">Prenda</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Lote</th>
              <th className="px-4 py-3 font-medium">Proveedor</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Género</th>
              <th className="px-4 py-3 font-medium">Talle</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Ingreso</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr
                key={p.id}
                className="border-b border-[var(--border)] last:border-0 hover:bg-surface-2/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Thumbnail
                      src={p.imagenPrincipal}
                      alt={p.nombre}
                      className="h-11 w-11 shrink-0 rounded-lg"
                    />
                    <div className="min-w-0">
                      <Link
                        href={`/inventario/prendas/${p.id}`}
                        className="block max-w-[220px] truncate font-medium text-foreground hover:underline"
                      >
                        {p.nombre}
                      </Link>
                      {p.subcategoria && (
                        <p className="truncate text-xs text-muted">
                          {p.subcategoria}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted">
                  {p.codigoInterno}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{p.lote}</td>
                <td className="px-4 py-3 text-muted">{p.proveedor}</td>
                <td className="px-4 py-3">
                  {CATEGORIA_LABELS[p.categoria as CategoriaValor] ??
                    p.categoria}
                </td>
                <td className="px-4 py-3 text-muted">
                  {GENERO_LABELS[p.genero as GeneroValor] ?? p.genero}
                </td>
                <td className="px-4 py-3 text-muted">{p.talle}</td>
                <td className="px-4 py-3 font-medium">
                  {formatMoney(p.precioVenta)}
                </td>
                <td className="px-4 py-3">
                  <EstadoBadge estado={p.estado} />
                </td>
                <td className="px-4 py-3 text-muted">{p.usuario}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                  {formatDate(p.fechaIngreso)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <ProductActions prenda={p} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
