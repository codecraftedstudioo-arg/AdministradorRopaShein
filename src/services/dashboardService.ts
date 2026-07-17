import "server-only";
import { ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { DashboardMetrics } from "@/types";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(): Date {
  const d = startOfToday();
  const day = (d.getDay() + 6) % 7; // lunes = 0
  d.setDate(d.getDate() - day);
  return d;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [
    totalProducts,
    available,
    sold,
    archived,
    reserved,
    inventoryValue,
    soldValue,
    loadedToday,
    loadedThisWeek,
    byCategoryRaw,
    byGenderRaw,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: ProductStatus.AVAILABLE } }),
    prisma.product.count({ where: { status: ProductStatus.SOLD } }),
    prisma.product.count({ where: { status: ProductStatus.ARCHIVED } }),
    prisma.product.count({ where: { status: ProductStatus.RESERVED } }),
    prisma.product.aggregate({
      _sum: { priceCents: true },
      where: { status: ProductStatus.AVAILABLE },
    }),
    prisma.sale.aggregate({ _sum: { finalPriceCents: true } }),
    prisma.product.count({ where: { createdAt: { gte: startOfToday() } } }),
    prisma.product.count({ where: { createdAt: { gte: startOfWeek() } } }),
    prisma.product.groupBy({ by: ["categoryId"], _count: true }),
    prisma.product.groupBy({ by: ["gender"], _count: true }),
  ]);

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
  });
  const catName = new Map(categories.map((c) => [c.id, c.name]));

  return {
    totalProducts,
    available,
    sold,
    archived,
    reserved,
    inventoryValueCents: inventoryValue._sum.priceCents ?? 0,
    soldValueCents: soldValue._sum.finalPriceCents ?? 0,
    loadedToday,
    loadedThisWeek,
    byCategory: byCategoryRaw.map((c) => ({
      name: catName.get(c.categoryId) ?? "—",
      count: c._count,
    })),
    byGender: byGenderRaw.map((g) => ({ gender: g.gender, count: g._count })),
  };
}

/** Últimos ingresos (prendas cargadas). */
export async function getLatestIntakes(limit = 5) {
  return prisma.product.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      createdBy: { select: { name: true } },
      category: true,
    },
  });
}

/** Últimas ventas. */
export async function getLatestSales(limit = 5) {
  return prisma.sale.findMany({
    take: limit,
    orderBy: { soldAt: "desc" },
    include: {
      product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
      registeredBy: { select: { name: true } },
    },
  });
}
