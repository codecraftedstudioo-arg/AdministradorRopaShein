import type { Metadata } from "next";
import {
  Sun,
  CalendarRange,
  CalendarDays,
  CalendarClock,
  ShoppingBag,
  TrendingUp,
  Wallet,
  Receipt,
} from "lucide-react";
import { ventasService } from "@shein/database";
import { PERMISOS } from "@shein/shared";
import { requirePermiso } from "@/auth/guards";
import { PageHeader } from "@/components/layout/PageHeader";
import { LinkButton } from "@/components/ui";
import { MetricCard } from "@/components/inventory/MetricCard";
import { SalesTable } from "@/components/sales/SalesTable";
import {
  VentasPorDiaChart,
  GananciasMensualesChart,
  VentasPorCanalChart,
  VentasPorCategoriaChart,
  TopVendedoresChart,
} from "@/components/sales/charts";
import { ReporteVendedores, ReporteCanales } from "@/components/sales/reports";
import { toVentaDTO } from "@/lib/sales";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = { title: "Ventas" };

export default async function VentasDashboardPage() {
  await requirePermiso(PERMISOS.VENTAS_VER);
  const a = await ventasService.analiticas();

  const periodoHint = (p: { cantidad: number; ganancia: number }) =>
    `${p.cantidad} venta${p.cantidad === 1 ? "" : "s"} · ${formatMoney(p.ganancia)} gan.`;

  return (
    <div>
      <PageHeader
        title="Ventas"
        description="Panel de control de ventas, ganancias y rendimiento."
        action={
          <LinkButton href="/ventas/listado" variant="outline">
            Ver todas las ventas
          </LinkButton>
        }
      />

      {/* Períodos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Ventas del día"
          value={formatMoney(a.periodos.dia.facturacion)}
          icon={Sun}
          hint={periodoHint(a.periodos.dia)}
        />
        <MetricCard
          label="Ventas de la semana"
          value={formatMoney(a.periodos.semana.facturacion)}
          icon={CalendarRange}
          hint={periodoHint(a.periodos.semana)}
        />
        <MetricCard
          label="Ventas del mes"
          value={formatMoney(a.periodos.mes.facturacion)}
          icon={CalendarDays}
          hint={periodoHint(a.periodos.mes)}
        />
        <MetricCard
          label="Ventas del año"
          value={formatMoney(a.periodos.anio.facturacion)}
          icon={CalendarClock}
          hint={periodoHint(a.periodos.anio)}
        />
      </div>

      {/* Totales */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Cantidad vendida"
          value={a.totales.cantidad}
          icon={ShoppingBag}
        />
        <MetricCard
          label="Ganancia total"
          value={formatMoney(a.totales.ganancia)}
          icon={TrendingUp}
          accent="text-emerald-500"
        />
        <MetricCard
          label="Precio promedio"
          value={formatMoney(a.totales.precioPromedio)}
          icon={Wallet}
        />
        <MetricCard
          label="Ticket promedio"
          value={formatMoney(a.totales.ticketPromedio)}
          icon={Receipt}
        />
      </div>

      {/* Gráficos */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <VentasPorDiaChart data={a.graficos.ventasPorDia} />
        <GananciasMensualesChart data={a.graficos.gananciasMensuales} />
        <VentasPorCanalChart data={a.graficos.ventasPorCanal} />
        <VentasPorCategoriaChart data={a.graficos.ventasPorCategoria} />
        <TopVendedoresChart data={a.graficos.topVendedores} />
      </div>

      {/* Reportes */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ReporteVendedores data={a.reporteVendedores} />
        <ReporteCanales
          data={a.reporteCanales.map((c) => ({
            canal: c.canal,
            cantidad: c.cantidad,
            facturacion: c.total,
            ganancia: c.ganancia,
          }))}
        />
      </div>

      {/* Últimas ventas */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">Últimas ventas</h2>
          <LinkButton href="/ventas/listado" variant="ghost">
            Ver todas
          </LinkButton>
        </div>
        {a.ultimas.length === 0 ? (
          <div className="card-surface p-6 text-sm text-muted">
            Todavía no hay ventas registradas.
          </div>
        ) : (
          <SalesTable items={a.ultimas.map(toVentaDTO)} />
        )}
      </div>
    </div>
  );
}
