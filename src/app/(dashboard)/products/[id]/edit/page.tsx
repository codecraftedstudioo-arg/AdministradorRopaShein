import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductForm } from "@/components/products/ProductForm";
import { getProductById } from "@/services/productService";
import {
  getCategoriesWithSubcategories,
  getAllTags,
} from "@/services/categoryService";
import type { ProductWithRelations } from "@/types";

export const metadata: Metadata = { title: "Editar prenda" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, tags] = await Promise.all([
    getProductById(id),
    getCategoriesWithSubcategories(),
    getAllTags(),
  ]);

  if (!product) notFound();

  return (
    <div className="animate-fade-in-up">
      <Link
        href={`/products/${id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a la ficha
      </Link>
      <PageHeader
        title="Editar prenda"
        description={`${product.name} · ${product.internalCode}`}
      />
      <ProductForm
        categories={categories}
        tags={tags}
        product={product as ProductWithRelations}
      />
    </div>
  );
}
