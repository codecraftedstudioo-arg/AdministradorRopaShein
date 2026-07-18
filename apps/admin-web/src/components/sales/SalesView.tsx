"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ArrowUp, ArrowDown, X } from "lucide-react";
import {
  CATEGORIAS,
  CATEGORIA_LABELS,
  CANALES_VENTA,
  CANAL_VENTA_LABELS,
} from "@shein/shared";
import { Button, Input, Select, Label, EmptyState, Pagination } from "@/components/ui";
import { useDebounce } from "@/hooks/useDebounce";
import { SalesTable } from "./SalesTable";
import { ExportMenu } from "./ExportMenu";
import type { VentaDTO, SalesFilterOptions } from "@/types/sales";

const ORDENES: { value: string; label: string }[] = [
  { value: "fecha", label: "Fecha" },
  { value: "ganancia", label: "Ganancia" },
  { value: "precio", label: "Precio" },
  { value: "categoria", label: "Categoría" },
  { value: "canal", label: "Canal" },
];

export interface SalesParams {
  q?: string;
  canal?: string;
  vend?: string;
  cat?: string;
  desde?: string;
  hasta?: string;
  min?: string;
  max?: string;
  gmin?: string;
  gmax?: string;
  sort?: string;
  dir?: string;
}

export function SalesView({
  items,
  total,
  page,
  pageSize,
  params,
  opciones,
}: {
  items: VentaDTO[];
  total: number;
  page: number;
  pageSize: number;
  params: SalesParams;
  opciones: SalesFilterOptions;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [panelAbierto, setPanelAbierto] = React.useState(false);
  const [q, setQ] = React.useState(params.q ?? "");
  const qDebounced = useDebounce(q, 300);
  const qActual = params.q ?? "";

  React.useEffect(() => {
    if (qDebounced !== qActual) update({ q: qDebounced || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced]);

  function update(cambios: Partial<SalesParams>, resetPage = true) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(cambios).forEach(([k, v]) => {
      if (!v) next.delete(k);
      else next.set(k, v);
    });
    if (resetPage) next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const [filtros, setFiltros] = React.useState({
    canal: params.canal ?? "",
    vend: params.vend ?? "",
    cat: params.cat ?? "",
    desde: params.desde ?? "",
    hasta: params.hasta ?? "",
    min: params.min ?? "",
    max: params.max ?? "",
    gmin: params.gmin ?? "",
    gmax: params.gmax ?? "",
  });

  const aplicar = () =>
    update({
      canal: filtros.canal || undefined,
      vend: filtros.vend || undefined,
      cat: filtros.cat || undefined,
      desde: filtros.desde || undefined,
      hasta: filtros.hasta || undefined,
      min: filtros.min || undefined,
      max: filtros.max || undefined,
      gmin: filtros.gmin || undefined,
      gmax: filtros.gmax || undefined,
    });

  const limpiar = () => {
    setFiltros({
      canal: "",
      vend: "",
      cat: "",
      desde: "",
      hasta: "",
      min: "",
      max: "",
      gmin: "",
      gmax: "",
    });
    update({
      canal: undefined,
      vend: undefined,
      cat: undefined,
      desde: undefined,
      hasta: undefined,
      min: undefined,
      max: undefined,
      gmin: undefined,
      gmax: undefined,
    });
  };

  const filtrosActivos = [
    params.canal,
    params.vend,
    params.cat,
    params.desde,
    params.hasta,
    params.min,
    params.max,
    params.gmin,
    params.gmax,
  ].filter(Boolean).length;

  const sort = params.sort ?? "fecha";
  const dir = params.dir === "asc" ? "asc" : "desc";
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por código, prenda, vendedor…"
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={sort}
            onChange={(e) => update({ sort: e.target.value }, false)}
            className="h-10 w-auto"
            aria-label="Ordenar por"
          >
            {ORDENES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => update({ dir: dir === "asc" ? "desc" : "asc" }, false)}
            aria-label="Dirección de orden"
          >
            {dir === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant={panelAbierto ? "secondary" : "outline"}
            onClick={() => setPanelAbierto((o) => !o)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {filtrosActivos > 0 && (
              <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] text-accent-foreground">
                {filtrosActivos}
              </span>
            )}
          </Button>
          <ExportMenu />
        </div>
      </div>

      {panelAbierto && (
        <div className="card-surface animate-fade-in p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Campo label="Canal">
              <Select
                value={filtros.canal}
                onChange={(e) => setFiltros((f) => ({ ...f, canal: e.target.value }))}
              >
                <option value="">Todos</option>
                {CANALES_VENTA.map((c) => (
                  <option key={c} value={c}>
                    {CANAL_VENTA_LABELS[c]}
                  </option>
                ))}
              </Select>
            </Campo>
            <Campo label="Vendedor">
              <Select
                value={filtros.vend}
                onChange={(e) => setFiltros((f) => ({ ...f, vend: e.target.value }))}
              >
                <option value="">Todos</option>
                {opciones.vendedores.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre}
                  </option>
                ))}
              </Select>
            </Campo>
            <Campo label="Categoría">
              <Select
                value={filtros.cat}
                onChange={(e) => setFiltros((f) => ({ ...f, cat: e.target.value }))}
              >
                <option value="">Todas</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORIA_LABELS[c]}
                  </option>
                ))}
              </Select>
            </Campo>
            <Campo label="Desde">
              <Input
                type="date"
                value={filtros.desde}
                onChange={(e) => setFiltros((f) => ({ ...f, desde: e.target.value }))}
              />
            </Campo>
            <Campo label="Hasta">
              <Input
                type="date"
                value={filtros.hasta}
                onChange={(e) => setFiltros((f) => ({ ...f, hasta: e.target.value }))}
              />
            </Campo>
            <Campo label="Precio mínimo">
              <Input
                type="number"
                min={0}
                value={filtros.min}
                onChange={(e) => setFiltros((f) => ({ ...f, min: e.target.value }))}
              />
            </Campo>
            <Campo label="Precio máximo">
              <Input
                type="number"
                min={0}
                value={filtros.max}
                onChange={(e) => setFiltros((f) => ({ ...f, max: e.target.value }))}
              />
            </Campo>
            <Campo label="Ganancia mínima">
              <Input
                type="number"
                value={filtros.gmin}
                onChange={(e) => setFiltros((f) => ({ ...f, gmin: e.target.value }))}
              />
            </Campo>
            <Campo label="Ganancia máxima">
              <Input
                type="number"
                value={filtros.gmax}
                onChange={(e) => setFiltros((f) => ({ ...f, gmax: e.target.value }))}
              />
            </Campo>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={limpiar}>
              <X className="h-4 w-4" />
              Limpiar
            </Button>
            <Button onClick={aplicar}>Aplicar filtros</Button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="card-surface p-10">
          <EmptyState
            title="Sin ventas"
            description="No hay ventas que coincidan con la búsqueda o los filtros."
          />
        </div>
      ) : (
        <SalesTable items={items} />
      )}

      <Pagination page={page} totalPages={totalPages} total={total} />
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
