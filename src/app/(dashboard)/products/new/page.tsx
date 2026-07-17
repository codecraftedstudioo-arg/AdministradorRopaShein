import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { NewProductTabs } from "@/components/products/NewProductTabs";
import {
  getCategoriesWithSubcategories,
  getAllTags,
} from "@/services/categoryService";

export const metadata: Metadata = { title: "Nueva prenda" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, tags] = await Promise.all([
    getCategoriesWithSubcategories(),
    getAllTags(),
  ]);

  return (
    <div className="animate-fade-in-up">
      <Link
        href="/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a productos
      </Link>
      <PageHeader
        title="Nueva prenda"
        description="Cargá una prenda única de forma manual o importá varias a la vez."
      />
      <NewProductTabs categories={categories} tags={tags} />
    </div>
  );
}
