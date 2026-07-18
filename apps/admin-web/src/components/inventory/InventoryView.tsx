"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  Plus,
  X,
} from "lucide-react";
import {
  PERMISOS,
  GENEROS,
  CATEGORIAS,
  GENERO_LABELS,
  CATEGORIA_LABELS,
  ESTADO_LABELS,
  type EstadoValor,
} from "@shein/shared";
import { Button, Input, Select, Label, EmptyState, Pagination } from "@/components/ui";
import { usePermissions } from "@/hooks/usePermissions";
import { useDebounce } from "@/hooks/useDebounce";
import { ProductTable } from "./ProductTable";
import { ProductGrid } from "./ProductGrid";
import type { PrendaListaDTO, OpcionesFiltroDTO } from "@/types/inventory";

const ORDENES: { value: string; label: string }[] = [
  { value: "fechaIngreso", label: "Fecha de ingreso" },
  { value: "nombre", label: "Nombre" },
  { value: "precioVenta", label: "Precio" },
  { value: "categoria", label: "Categoría" },
  { value: "codigoInterno", label: "SKU" },
  { value: "estado", label: "Estado" },
];

export interface InventoryParams {
  q?: string;
  cat?: string;
  sub?: string;
  gen?: string;
  talle?: string;
  estado?: string;
  user?: string;
  lote?: string;
  prov?: string;
  desde?: string;
  hasta?: string;
  min?: string;
  max?: string;
  sort?: string;
  dir?: string;
  view?: string;
}

export function InventoryView({
  items,
  total,
  page,
  pageSize,
  params,
  opciones,
  estadosFiltro,
  mostrarNueva = true,
}: {
  items: PrendaListaDTO[];
  total: number;
  page: number;
  pageSize: number;
  params: InventoryParams;
  opciones: OpcionesFiltroDTO;
  estadosFiltro: EstadoValor[];
  mostrarNueva?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { can } = usePermissions();

  const vista = params.view === "cards" ? "cards" : "tabla";
  const [panelAbierto, setPanelAbierto] = React.useState(false);

  // --- Búsqueda instantánea (debounced) ---
  const [q, setQ] = React.useState(params.q ?? "");
  const qDebounced = useDebounce(q, 300);
  const qActual = params.q ?? "";
  React.useEffect(() => {
    if (qDebounced !== qActual) update({ q: qDebounced || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced]);

  function update(cambios: Partial<InventoryParams>, resetPage = true) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(cambios).forEach(([k, v]) => {
      if (!v) next.delete(k);
      else next.set(k, v);
    });
    if (resetPage) next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  // --- Filtros (estado local, se aplican con el botón) ---
  const [filtros, setFiltros] = React.useState({
    cat: params.cat ?? "",
    sub: params.sub ?? "",
    gen: params.gen ?? "",
    talle: params.talle ?? "",
    estado: params.estado ?? "",
    user: params.user ?? "",
    lote: params.lote ?? "",
    prov: params.prov ?? "",
    desde: params.desde ?? "",
    hasta: params.hasta ?? "",
    min: params.min ?? "",
    max: params.max ?? "",
  });

  const aplicarFiltros = () => {
    update({
      cat: filtros.cat || undefined,
      sub: filtros.sub || undefined,
      gen: filtros.gen || undefined,
      talle: filtros.talle || undefined,
      estado: filtros.estado || undefined,
      user: filtros.user || undefined,
      lote: filtros.lote || undefined,
      prov: filtros.prov || undefined,
      desde: filtros.desde || undefined,
      hasta: filtros.hasta || undefined,
      min: filtros.min || undefined,
      max: filtros.max || undefined,
    });
  };

  const limpiarFiltros = () => {
    setFiltros({
      cat: "",
      sub: "",
      gen: "",
      talle: "",
      estado: "",
      user: "",
      lote: "",
      prov: "",
      desde: "",
      hasta: "",
      min: "",
      max: "",
    });
    update({
      cat: undefined,
      sub: undefined,
      gen: undefined,
      talle: undefined,
      estado: undefined,
      user: undefined,
      lote: undefined,
      prov: undefined,
      desde: undefined,
      hasta: undefined,
      min: undefined,
      max: undefined,
    });
  };

  const filtrosActivos = [
    params.cat,
    params.sub,
    params.gen,
    params.talle,
    params.estado,
    params.user,
    params.lote,
    params.prov,
    params.desde,
    params.hasta,
    params.min,
    params.max,
  ].filter(Boolean).length;

  const sort = params.sort ?? "fechaIngreso";
  const dir = params.dir === "asc" ? "asc" : "desc";
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por SKU, nombre, lote, proveedor…"
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

          <div className="flex overflow-hidden rounded-xl border border-[var(--border-strong)]">
            <button
              onClick={() => update({ view: undefined }, false)}
              className={`flex h-10 w-10 items-center justify-center transition-colors ${
                vista === "tabla"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:bg-surface-2"
              }`}
              aria-label="Vista tabla"
            >
              <ListIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => update({ view: "cards" }, false)}
              className={`flex h-10 w-10 items-center justify-center transition-colors ${
                vista === "cards"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:bg-surface-2"
              }`}
              aria-label="Vista tarjetas"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          {mostrarNueva && can(PERMISOS.PRENDAS_CREAR) && (
            <Button onClick={() => router.push("/inventario/prendas/nueva")}>
              <Plus className="h-4 w-4" />
              Nueva prenda
            </Button>
          )}
        </div>
      </div>

      {/* Panel de filtros */}
      {panelAbierto && (
        <div className="card-surface animate-fade-in p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            <Campo label="Subcategoría">
              <Select
                value={filtros.sub}
                onChange={(e) => setFiltros((f) => ({ ...f, sub: e.target.value }))}
              >
                <option value="">Todas</option>
                {opciones.subcategorias.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Campo>
            <Campo label="Género">
              <Select
                value={filtros.gen}
                onChange={(e) => setFiltros((f) => ({ ...f, gen: e.target.value }))}
              >
                <option value="">Todos</option>
                {GENEROS.map((g) => (
                  <option key={g} value={g}>
                    {GENERO_LABELS[g]}
                  </option>
                ))}
              </Select>
            </Campo>
            <Campo label="Talle">
              <Select
                value={filtros.talle}
                onChange={(e) => setFiltros((f) => ({ ...f, talle: e.target.value }))}
              >
                <option value="">Todos</option>
                {opciones.talles.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Campo>
            <Campo label="Proveedor">
              <Select
                value={filtros.prov}
                onChange={(e) => setFiltros((f) => ({ ...f, prov: e.target.value }))}
              >
                <option value="">Todos</option>
                {opciones.proveedores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </Select>
            </Campo>
            <Campo label="Lote">
              <Select
                value={filtros.lote}
                onChange={(e) => setFiltros((f) => ({ ...f, lote: e.target.value }))}
              >
                <option value="">Todos</option>
                {opciones.lotes.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.numero} · {l.proveedor}
                  </option>
                ))}
              </Select>
            </Campo>
            <Campo label="Estado">
              <Select
                value={filtros.estado}
                onChange={(e) =>
                  setFiltros((f) => ({ ...f, estado: e.target.value }))
                }
              >
                <option value="">Todos</option>
                {estadosFiltro.map((e) => (
                  <option key={e} value={e}>
                    {ESTADO_LABELS[e]}
                  </option>
                ))}
              </Select>
            </Campo>
            <Campo label="Usuario">
              <Select
                value={filtros.user}
                onChange={(e) => setFiltros((f) => ({ ...f, user: e.target.value }))}
              >
                <option value="">Todos</option>
                {opciones.usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre}
                  </option>
                ))}
              </Select>
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
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={limpiarFiltros}>
              <X className="h-4 w-4" />
              Limpiar
            </Button>
            <Button onClick={aplicarFiltros}>Aplicar filtros</Button>
          </div>
        </div>
      )}

      {/* Contenido */}
      {items.length === 0 ? (
        <div className="card-surface p-10">
          <EmptyState
            title="Sin prendas"
            description="No hay prendas que coincidan con la búsqueda o los filtros."
          />
        </div>
      ) : vista === "cards" ? (
        <ProductGrid items={items} />
      ) : (
        <ProductTable items={items} />
      )}

      <Pagination page={page} totalPages={totalPages} total={total} />
    </div>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
