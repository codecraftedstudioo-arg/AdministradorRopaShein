"use client";

import Link from "next/link";
import {
  CATEGORIA_LABELS,
  type CategoriaValor,
} from "@shein/shared";
import { CanalBadge } from "./CanalBadge";
import { Thumbnail } from "@/components/inventory/Thumbnail";
import { formatMoney } from "@/lib/utils";
import type { VentaDTO } from "@/types/sales";

function fechaHora(iso: string) {
  const d = new Date(iso);
  return {
    fecha: d.toLocaleDateString("es-AR"),
    hora: d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function SalesTable({ items }: { items: VentaDTO[] }) {
  return (
    <div className="card-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs text-muted">
              <th className="px-4 py-3 font-medium">Prenda</th>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Costo</th>
              <th className="px-4 py-3 font-medium">Ganancia</th>
              <th className="px-4 py-3 font-medium">Canal</th>
              <th className="px-4 py-3 font-medium">Vendedor</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Hora</th>
            </tr>
          </thead>
          <tbody>
            {items.map((v) => {
              const { fecha, hora } = fechaHora(v.fecha);
              return (
                <tr
                  key={v.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-surface-2/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Thumbnail
                        src={v.imagen}
                        alt={v.nombre}
                        className="h-10 w-10 shrink-0 rounded-lg"
                      />
                      <Link
                        href={`/inventario/prendas/${v.prendaId}`}
                        className="block max-w-[200px] truncate font-medium text-foreground hover:underline"
                      >
                        {v.nombre}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">
                    {v.codigoInterno}
                  </td>
                  <td className="px-4 py-3">
                    {CATEGORIA_LABELS[v.categoria as CategoriaValor] ??
                      v.categoria}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatMoney(v.precioFinal)}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {formatMoney(v.costo)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        v.ganancia >= 0
                          ? "font-medium text-emerald-600 dark:text-emerald-400"
                          : "font-medium text-red-600 dark:text-red-400"
                      }
                    >
                      {formatMoney(v.ganancia)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <CanalBadge canal={v.canal} />
                  </td>
                  <td className="px-4 py-3 text-muted">{v.vendedor}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {fecha}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {hora}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
