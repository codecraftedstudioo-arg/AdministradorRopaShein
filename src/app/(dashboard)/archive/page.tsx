import type { Metadata } from "next";
import { Archive as ArchiveIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductsTable } from "@/components/products/ProductsTable";
import {
  EmptyState,
  Pagination,
  SearchInput,
} from "@/components/ui";
import { requireAuth } from "@/lib/auth";
import { listArchive } from "@/services/productService";
import type { ProductWithRelations } from "@/types";

export const metadata: Metadata = { title: "Archivo" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const user = await requireAuth();
  const result = await listArchive({
    search: sp.search,
    page: sp.page ? Number(sp.page) : 1,
    pageSize: 20,
  });

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Archivo"
        description="Prendas vendidas y archivadas. Nunca se eliminan: se conserva todo su historial."
      />

      <div className="mb-4">
        <SearchInput placeholder="Buscar por nombre, código o vendedor..." />
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          icon={ArchiveIcon}
          title="El archivo está vacío"
          description="Las prendas vendidas o archivadas aparecerán aquí."
        />
      ) : (
        <>
          <ProductsTable
            items={result.items as ProductWithRelations[]}
            currentUserName={user.name}
          />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
          />
        </>
      )}
    </div>
  );
}
