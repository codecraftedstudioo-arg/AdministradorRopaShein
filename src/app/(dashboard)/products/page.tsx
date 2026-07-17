import Link from "next/link";
import type { Metadata } from "next";
import { Plus, Shirt } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductsToolbar } from "@/components/products/ProductsToolbar";
import { ProductsTable } from "@/components/products/ProductsTable";
import { Button, EmptyState, Pagination } from "@/components/ui";
import { requireAuth } from "@/lib/auth";
import { listProducts } from "@/services/productService";
import {
  getCategoriesWithSubcategories,
  getAllTags,
} from "@/services/categoryService";
import { listUsers } from "@/services/userService";
import type { ProductFilters, ProductWithRelations } from "@/types";
import type { Gender, ProductStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Productos" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const user = await requireAuth();

  const filters: ProductFilters = {
    search: sp.search,
    status: (sp.status as ProductStatus) ?? "ALL",
    gender: (sp.gender as Gender) ?? "ALL",
    categoryId: sp.categoryId,
    tagId: sp.tagId,
    createdById: sp.createdById,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    dateFrom: sp.dateFrom,
    dateTo: sp.dateTo,
    page: sp.page ? Number(sp.page) : 1,
    pageSize: 20,
  };

  const [result, categories, tags, users] = await Promise.all([
    listProducts(filters),
    getCategoriesWithSubcategories(),
    getAllTags(),
    listUsers(),
  ]);

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Productos"
        description="Inventario de prendas únicas provenientes de Mystery Boxes."
        action={
          <Link href="/products/new">
            <Button>
              <Plus className="h-4 w-4" /> Nueva prenda
            </Button>
          </Link>
        }
      />

      <ProductsToolbar
        categories={categories}
        tags={tags}
        users={users.map((u) => ({ id: u.id, name: u.name }))}
      />

      {result.items.length === 0 ? (
        <EmptyState
          icon={Shirt}
          title="No se encontraron prendas"
          description="Ajustá los filtros o cargá tu primera prenda al inventario."
          action={
            <Link href="/products/new">
              <Button>
                <Plus className="h-4 w-4" /> Nueva prenda
              </Button>
            </Link>
          }
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
