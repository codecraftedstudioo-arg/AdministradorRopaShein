import Link from "next/link";
import type { Metadata } from "next";
import {
  Boxes,
  CheckCircle2,
  DollarSign,
  Archive,
  Wallet,
  TrendingUp,
  CalendarDays,
  CalendarClock,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Thumbnail } from "@/components/products/Thumbnail";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  EmptyState,
} from "@/components/ui";
import {
  getDashboardMetrics,
  getLatestIntakes,
  getLatestSales,
} from "@/services/dashboardService";
import { getRecentActivity } from "@/services/auditService";
import { formatCurrency, formatDate } from "@/lib/utils";
import { GENDER_LABELS } from "@/utils/constants";
import type { AuditLogWithActor } from "@/types";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [metrics, intakes, sales, activity] = await Promise.all([
    getDashboardMetrics(),
    getLatestIntakes(5),
    getLatestSales(5),
    getRecentActivity(8),
  ]);

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Dashboard"
        description="Resumen general del inventario y la actividad reciente."
      />

      {/* Métricas principales */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Total de prendas"
          value={metrics.totalProducts}
          icon={Boxes}
        />
        <MetricCard
          label="Disponibles"
          value={metrics.available}
          icon={CheckCircle2}
          accent="emerald"
        />
        <MetricCard
          label="Vendidas"
          value={metrics.sold}
          icon={DollarSign}
          accent="blue"
        />
        <MetricCard
          label="Archivadas"
          value={metrics.archived}
          icon={Archive}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Valor del inventario"
          value={formatCurrency(metrics.inventoryValueCents)}
          icon={Wallet}
          sub="Prendas disponibles"
        />
        <MetricCard
          label="Total vendido"
          value={formatCurrency(metrics.soldValueCents)}
          icon={TrendingUp}
          accent="emerald"
        />
        <MetricCard
          label="Cargadas hoy"
          value={metrics.loadedToday}
          icon={CalendarDays}
          accent="amber"
        />
        <MetricCard
          label="Cargadas esta semana"
          value={metrics.loadedThisWeek}
          icon={CalendarClock}
          accent="amber"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Columna izquierda: ingresos + ventas */}
        <div className="space-y-6 lg:col-span-2">
          {/* Últimos ingresos */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Últimos ingresos</CardTitle>
              <Link
                href="/products"
                className="flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-foreground"
              >
                Ver todos <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {intakes.length === 0 ? (
                <div className="p-6">
                  <EmptyState icon={Boxes} title="Sin ingresos todavía" />
                </div>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {intakes.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/products/${p.id}`}
                        className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-surface-2"
                      >
                        <Thumbnail
                          src={p.images[0]?.url}
                          alt={p.name}
                          className="h-11 w-11"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted">
                            {p.category.name} · {p.internalCode}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium tabular-nums">
                            {formatCurrency(p.priceCents)}
                          </p>
                          <p className="text-xs text-muted">
                            {formatDate(p.createdAt)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Últimas ventas */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Últimas ventas</CardTitle>
              <Link
                href="/archive"
                className="flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-foreground"
              >
                Ver archivo <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {sales.length === 0 ? (
                <div className="p-6">
                  <EmptyState icon={DollarSign} title="Sin ventas todavía" />
                </div>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {sales.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center gap-3 px-6 py-3"
                    >
                      <Thumbnail
                        src={s.product.images[0]?.url}
                        alt={s.product.name}
                        className="h-11 w-11"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {s.product.name}
                        </p>
                        <p className="text-xs text-muted">
                          {s.sellerName} · {formatDate(s.soldAt)}
                        </p>
                      </div>
                      <p className="text-sm font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(s.finalPriceCents)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: distribuciones + actividad */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Por categoría</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DistributionList
                data={metrics.byCategory.map((c) => ({
                  label: c.name,
                  count: c.count,
                }))}
                total={metrics.totalProducts}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Por género</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DistributionList
                data={metrics.byGender.map((g) => ({
                  label: GENDER_LABELS[g.gender],
                  count: g.count,
                }))}
                total={metrics.totalProducts}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actividad reciente</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ActivityFeed items={activity as AuditLogWithActor[]} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DistributionList({
  data,
  total,
}: {
  data: { label: string; count: number }[];
  total: number;
}) {
  if (data.length === 0) {
    return <p className="text-sm text-muted">Sin datos.</p>;
  }
  return (
    <>
      {data.map((d) => {
        const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
        return (
          <div key={d.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-foreground">{d.label}</span>
              <span className="tabular-nums text-muted">{d.count}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}
