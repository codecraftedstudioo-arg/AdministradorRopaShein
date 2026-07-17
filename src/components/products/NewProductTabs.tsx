"use client";

import * as React from "react";
import { PencilLine, Upload } from "lucide-react";
import { ProductForm } from "./ProductForm";
import { ImportProducts } from "./ImportProducts";
import { cn } from "@/lib/utils";
import type { Tag } from "@prisma/client";
import type { CategoryWithSubcategories } from "@/types";

export function NewProductTabs({
  categories,
  tags,
}: {
  categories: CategoryWithSubcategories[];
  tags: Tag[];
}) {
  const [tab, setTab] = React.useState<"manual" | "import">("manual");

  return (
    <div>
      <div className="mb-6 inline-flex rounded-xl border border-[var(--border)] bg-surface p-1">
        {[
          { id: "manual" as const, label: "Carga manual", icon: PencilLine },
          { id: "import" as const, label: "Importar CSV / Excel", icon: Upload },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
              tab === id
                ? "bg-accent text-accent-foreground shadow-[var(--shadow-soft)]"
                : "text-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "manual" ? (
        <ProductForm categories={categories} tags={tags} />
      ) : (
        <ImportProducts />
      )}
    </div>
  );
}
