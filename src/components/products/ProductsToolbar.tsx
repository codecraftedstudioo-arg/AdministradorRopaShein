"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input, Select, Button } from "@/components/ui";
import { useDebounce } from "@/hooks/useDebounce";
import { STATUS_LABELS, GENDER_LABELS } from "@/utils/constants";
import type { Category, Tag } from "@prisma/client";
import { cn } from "@/lib/utils";

interface Props {
  categories: Category[];
  tags: Tag[];
  users: { id: string; name: string }[];
}

export function ProductsToolbar({ categories, tags, users }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [search, setSearch] = React.useState(params.get("search") ?? "");
  const [showFilters, setShowFilters] = React.useState(false);
  const debouncedSearch = useDebounce(search, 350);
  const firstRender = React.useRef(true);

  const updateParam = React.useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value && value !== "ALL" && value !== "") next.set(key, value);
        else next.delete(key);
      }
      next.delete("page");
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    updateParam({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const activeFilters = [
    "status",
    "gender",
    "categoryId",
    "tagId",
    "createdById",
    "minPrice",
    "maxPrice",
    "dateFrom",
    "dateTo",
  ].filter((k) => params.get(k)).length;

  const clearAll = () => {
    setSearch("");
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, código o descripción..."
            className="pl-10"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters ? "secondary" : "outline"}
          onClick={() => setShowFilters((s) => !s)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {activeFilters > 0 && (
            <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs text-accent-foreground">
              {activeFilters}
            </span>
          )}
        </Button>
      </div>

      {showFilters && (
        <div className="animate-fade-in grid grid-cols-1 gap-3 rounded-2xl border border-[var(--border)] bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect
            label="Estado"
            value={params.get("status") ?? "ALL"}
            onChange={(v) => updateParam({ status: v })}
            options={[
              { value: "ALL", label: "Todos" },
              ...Object.entries(STATUS_LABELS).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
          <FilterSelect
            label="Género"
            value={params.get("gender") ?? "ALL"}
            onChange={(v) => updateParam({ gender: v })}
            options={[
              { value: "ALL", label: "Todos" },
              ...Object.entries(GENDER_LABELS).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
          <FilterSelect
            label="Categoría"
            value={params.get("categoryId") ?? "ALL"}
            onChange={(v) => updateParam({ categoryId: v })}
            options={[
              { value: "ALL", label: "Todas" },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <FilterSelect
            label="Etiqueta"
            value={params.get("tagId") ?? "ALL"}
            onChange={(v) => updateParam({ tagId: v })}
            options={[
              { value: "ALL", label: "Todas" },
              ...tags.map((t) => ({ value: t.id, label: t.name })),
            ]}
          />
          <FilterSelect
            label="Cargado por"
            value={params.get("createdById") ?? "ALL"}
            onChange={(v) => updateParam({ createdById: v })}
            options={[
              { value: "ALL", label: "Todos" },
              ...users.map((u) => ({ value: u.id, label: u.name })),
            ]}
          />
          <PriceInput
            label="Precio mín."
            defaultValue={params.get("minPrice") ?? ""}
            onCommit={(v) => updateParam({ minPrice: v })}
          />
          <PriceInput
            label="Precio máx."
            defaultValue={params.get("maxPrice") ?? ""}
            onCommit={(v) => updateParam({ maxPrice: v })}
          />
          <div className="flex items-end">
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted">
              <X className="h-4 w-4" /> Limpiar filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted">
        {label}
      </label>
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

function PriceInput({
  label,
  defaultValue,
  onCommit,
}: {
  label: string;
  defaultValue: string;
  onCommit: (v: string) => void;
}) {
  const [value, setValue] = React.useState(defaultValue);
  const debounced = useDebounce(value, 500);
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onCommit(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted">
        {label}
      </label>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="$"
      />
    </div>
  );
}
