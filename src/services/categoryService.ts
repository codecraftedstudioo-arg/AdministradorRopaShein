import "server-only";
import { prisma } from "@/lib/prisma";

/** Todas las categorías con sus subcategorías, ordenadas. */
export async function getCategoriesWithSubcategories() {
  return prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      subcategories: { orderBy: { order: "asc" } },
    },
  });
}

export async function getAllTags() {
  return prisma.tag.findMany({ orderBy: { name: "asc" } });
}
