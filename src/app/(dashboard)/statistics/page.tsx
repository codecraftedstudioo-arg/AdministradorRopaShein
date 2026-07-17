import type { Metadata } from "next";
import { Archive, DollarSign, ShoppingBag, Package } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { StatisticsCharts } from "@/components/charts/StatisticsCharts";
import { getStatistics } from "@/services/statisticsService";
import { getDashboardMetrics } from "@/services/dashboardService";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Estadísticas" };
export const dynamic = "force-dynamic";

export default async function StatisticsPage() {
  const [stats, metrics] = await Promise.all([
    getStatistics(),
    getDashboardMetrics(),
  ]);

  const totalSalesValue = stats.salesByMonth.reduce(
    (sum, m) => sum + m.valueCents,
    0,
  );
  const totalSales = stats.salesByMonth.reduce((sum, m) => sum + m.count, 0);

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Estadísticas"
        description="Análisis de ventas, ingresos y rendimiento del inventario (últimos 6 meses)."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Ventas (6 meses)"
          value={totalSales}
          icon={ShoppingBag}
          accent="blue"
        />
        <MetricCard
          label="Valor vendido (6 meses)"
          value={formatCurrency(totalSalesValue)}
          icon={DollarSign}
          accent="emerald"
        />
        <MetricCard
          label="Prendas totales"
          value={metrics.totalProducts}
          icon={Package}
        />
        <MetricCard
          label="Archivadas"
          value={stats.archivedCount}
          icon={Archive}
        />
      </div>

      <StatisticsCharts data={stats} />
    </div>
  );
}
