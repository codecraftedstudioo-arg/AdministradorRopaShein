import "server-only";
import { ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { StatisticsData } from "@/types";

const MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function lastNMonths(n: number): { key: string; label: string }[] {
  const arr: { key: string; label: string }[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    arr.push({ key: monthKey(m), label: `${MONTHS[m.getMonth()]} ${String(m.getFullYear()).slice(2)}` });
  }
  return arr;
}

export async function getStatistics(): Promise<StatisticsData> {
  const months = lastNMonths(6);
  const since = new Date();
  since.setMonth(since.getMonth() - 6);

  const [sales, products, byChannelRaw, archivedCount] = await Promise.all([
    prisma.sale.findMany({
      where: { soldAt: { gte: since } },
      select: {
        soldAt: true,
        finalPriceCents: true,
        channel: true,
        product: { select: { category: { select: { name: true } } } },
      },
    }),
    prisma.product.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.sale.groupBy({ by: ["channel"], _count: true }),
    prisma.product.count({ where: { status: ProductStatus.ARCHIVED } }),
  ]);

  // Ventas por mes
  const salesByMonth = months.map((m) => {
    const inMonth = sales.filter((s) => monthKey(s.soldAt) === m.key);
    return {
      month: m.label,
      count: inMonth.length,
      valueCents: inMonth.reduce((sum, s) => sum + s.finalPriceCents, 0),
    };
  });

  // Ventas por categoría
  const catMap = new Map<string, number>();
  for (const s of sales) {
    const name = s.product.category.name;
    catMap.set(name, (catMap.get(name) ?? 0) + 1);
  }
  const salesByCategory = [...catMap.entries()].map(([name, count]) => ({
    name,
    count,
  }));

  // Prendas cargadas por mes
  const productsLoadedByMonth = months.map((m) => ({
    month: m.label,
    count: products.filter((p) => monthKey(p.createdAt) === m.key).length,
  }));

  return {
    salesByMonth,
    salesByCategory,
    salesByChannel: byChannelRaw.map((c) => ({
      channel: c.channel,
      count: c._count,
    })),
    productsLoadedByMonth,
    archivedCount,
  };
}
