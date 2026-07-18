"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  CATEGORIA_LABELS,
  CANAL_VENTA_LABELS,
  type CategoriaValor,
  type CanalVentaValor,
} from "@shein/shared";
import { Card, CardHeader, CardTitle, CardContent, EmptyState } from "@/components/ui";
import { formatMoney } from "@/lib/utils";

const PALETA = ["#6366f1", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6"];
const EJE = "#9ca3af";
const GRID = "rgba(148,148,148,0.15)";

const compacto = (n: number) =>
  new Intl.NumberFormat("es-AR", { notation: "compact" }).format(n);

function ChartCard({
  title,
  children,
  vacio,
  className,
}: {
  title: string;
  children: React.ReactNode;
  vacio: boolean;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {vacio ? (
          <div className="flex h-[240px] items-center justify-center">
            <EmptyState title="Sin datos" description="Todavía no hay ventas." />
          </div>
        ) : (
          <div className="h-[240px] w-full">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}

const tooltipStyle = {
  contentStyle: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    fontSize: 12,
  },
  labelStyle: { color: "var(--foreground)" },
};

export function VentasPorDiaChart({
  data,
}: {
  data: { fecha: string; total: number }[];
}) {
  const vacio = data.every((d) => d.total === 0);
  return (
    <ChartCard title="Ventas por día (30 días)" vacio={vacio} className="lg:col-span-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="gVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PALETA[0]} stopOpacity={0.4} />
              <stop offset="100%" stopColor={PALETA[0]} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: EJE }} interval={4} />
          <YAxis tick={{ fontSize: 11, fill: EJE }} tickFormatter={compacto} width={44} />
          <Tooltip
            {...tooltipStyle}
            formatter={(value) => [formatMoney(Number(value)), "Ventas"]}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke={PALETA[0]}
            strokeWidth={2}
            fill="url(#gVentas)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function GananciasMensualesChart({
  data,
}: {
  data: { mes: string; facturacion: number; ganancia: number }[];
}) {
  const vacio = data.every((d) => d.facturacion === 0 && d.ganancia === 0);
  return (
    <ChartCard title="Ganancias mensuales (12 meses)" vacio={vacio} className="lg:col-span-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: EJE }} />
          <YAxis tick={{ fontSize: 11, fill: EJE }} tickFormatter={compacto} width={44} />
          <Tooltip
            {...tooltipStyle}
            formatter={(value, name) => [
              formatMoney(Number(value)),
              name === "ganancia" ? "Ganancia" : "Facturación",
            ]}
          />
          <Bar dataKey="facturacion" fill={PALETA[3]} radius={[4, 4, 0, 0]} />
          <Bar dataKey="ganancia" fill={PALETA[1]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function VentasPorCanalChart({
  data,
}: {
  data: { canal: string; cantidad: number }[];
}) {
  const conValor = data.filter((d) => d.cantidad > 0);
  return (
    <ChartCard title="Ventas por canal" vacio={conValor.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={conValor}
            dataKey="cantidad"
            nameKey="canal"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
          >
            {conValor.map((_, i) => (
              <Cell key={i} fill={PALETA[i % PALETA.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            {...tooltipStyle}
            formatter={(value, name) => [
              value,
              CANAL_VENTA_LABELS[name as CanalVentaValor] ?? name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {conValor.map((d, i) => (
          <span key={d.canal} className="flex items-center gap-1.5 text-xs text-muted">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: PALETA[i % PALETA.length] }}
            />
            {CANAL_VENTA_LABELS[d.canal as CanalVentaValor] ?? d.canal}
          </span>
        ))}
      </div>
    </ChartCard>
  );
}

export function VentasPorCategoriaChart({
  data,
}: {
  data: { categoria: string; total: number }[];
}) {
  const conLabel = data.map((d) => ({
    categoria: CATEGORIA_LABELS[d.categoria as CategoriaValor] ?? d.categoria,
    total: d.total,
  }));
  return (
    <ChartCard title="Ventas por categoría" vacio={conLabel.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={conLabel}
          layout="vertical"
          margin={{ top: 8, right: 12, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: EJE }} tickFormatter={compacto} />
          <YAxis
            type="category"
            dataKey="categoria"
            tick={{ fontSize: 11, fill: EJE }}
            width={72}
          />
          <Tooltip
            {...tooltipStyle}
            formatter={(value) => [formatMoney(Number(value)), "Total"]}
          />
          <Bar dataKey="total" fill={PALETA[5]} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TopVendedoresChart({
  data,
}: {
  data: { vendedor: string; total: number }[];
}) {
  return (
    <ChartCard title="Top vendedores" vacio={data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 12, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: EJE }} tickFormatter={compacto} />
          <YAxis
            type="category"
            dataKey="vendedor"
            tick={{ fontSize: 11, fill: EJE }}
            width={110}
          />
          <Tooltip
            {...tooltipStyle}
            formatter={(value) => [formatMoney(Number(value)), "Vendido"]}
          />
          <Bar dataKey="total" fill={PALETA[0]} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
