import Link from "next/link";
import { Thumbnail } from "./Thumbnail";
import { ProductRowActions } from "./ProductRowActions";
import { StatusBadge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { GENDER_LABELS } from "@/utils/constants";
import type { ProductWithRelations } from "@/types";

export function ProductsTable({
  items,
  currentUserName,
}: {
  items: ProductWithRelations[];
  currentUserName: string;
}) {
  return (
    <div className="card-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs font-medium text-muted">
              <th className="px-4 py-3 font-medium">Prenda</th>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Talle</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {items.map((p) => {
              const primary =
                p.images.find((i) => i.isPrimary) ?? p.images[0];
              return (
                <tr
                  key={p.id}
                  className="group transition-colors hover:bg-surface-2"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/products/${p.id}`}
                      className="flex items-center gap-3"
                    >
                      <Thumbnail
                        src={primary?.url}
                        alt={p.name}
                        className="h-10 w-10"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted">
                          {GENDER_LABELS[p.gender]} · {p.subcategory.name}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">
                    {p.internalCode}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {p.category.name}
                  </td>
                  <td className="px-4 py-3 text-foreground">{p.size}</td>
                  <td className="px-4 py-3 font-medium tabular-nums">
                    {formatCurrency(p.priceCents)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {formatDate(p.intakeAt)}
                  </td>
                  <td className="px-4 py-3 text-muted">{p.createdBy.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <ProductRowActions
                        id={p.id}
                        name={p.name}
                        status={p.status}
                        priceCents={p.priceCents}
                        currentUserName={currentUserName}
                      />
                    </div>
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
