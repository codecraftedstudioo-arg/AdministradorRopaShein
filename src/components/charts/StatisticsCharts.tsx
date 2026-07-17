"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { CHANNEL_LABELS } from "@/utils/constants";
import type { StatisticsData } from "@/types";

const PALETTE = ["#0a0a0a", "#525252", "#a3a3a3", "#737373", "#404040", "#d4d4d4"];
const PALETTE_DARK = ["#fafafa", "#a3a3a3", "#525252", "#737373", "#d4d4d4", "#404040"];

function useAxisColor() {
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark")),
    );
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);
  return {
    dark,
    axis: dark ? "#a1a1a1" : "#737373",
    grid: dark ? "#262626" : "#ebebeb",
    bar: dark ? "#fafafa" : "#0a0a0a",
    palette: dark ? PALETTE_DARK : PALETTE,
  };
}

function ChartTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
  label?: string;
  currency?: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-surface px-3 py-2 text-xs shadow-[var(--shadow-hover)]">
      {label && <p className="mb-1 font-medium">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="tabular-nums text-muted">
          {currency ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

export function StatisticsCharts({ data }: { data: StatisticsData }) {
  const c = useAxisColor();

  const channelData = data.salesByChannel.map((s) => ({
    name: CHANNEL_LABELS[s.channel],
    value: s.count,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Ventas por mes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.salesByMonth}>
              <CartesianGrid vertical={false} stroke={c.grid} />
              <XAxis dataKey="month" stroke={c.axis} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={c.axis} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: c.grid, opacity: 0.4 }} />
              <Bar dataKey="count" fill={c.bar} radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valor vendido por mes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.salesByMonth}>
              <defs>
                <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.bar} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={c.bar} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={c.grid} />
              <XAxis dataKey="month" stroke={c.axis} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke={c.axis}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${(v / 100000).toFixed(0)}k`}
              />
              <Tooltip content={<ChartTooltip currency />} />
              <Area
                type="monotone"
                dataKey="valueCents"
                stroke={c.bar}
                strokeWidth={2}
                fill="url(#valueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ventas por categoría</CardTitle>
        </CardHeader>
        <CardContent>
          {data.salesByCategory.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.salesByCategory} layout="vertical">
                <CartesianGrid horizontal={false} stroke={c.grid} />
                <XAxis type="number" stroke={c.axis} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke={c.axis}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={70}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: c.grid, opacity: 0.4 }} />
                <Bar dataKey="count" fill={c.bar} radius={[0, 6, 6, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Canales de venta</CardTitle>
        </CardHeader>
        <CardContent>
          {channelData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={channelData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {channelData.map((_, i) => (
                    <Cell key={i} fill={c.palette[i % c.palette.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-3 flex flex-wrap justify-center gap-4">
            {channelData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: c.palette[i % c.palette.length] }}
                />
                <span className="text-muted">{d.name}</span>
                <span className="font-medium tabular-nums">{d.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Prendas cargadas por mes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.productsLoadedByMonth}>
              <CartesianGrid vertical={false} stroke={c.grid} />
              <XAxis dataKey="month" stroke={c.axis} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={c.axis} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: c.grid, opacity: 0.4 }} />
              <Bar dataKey="count" fill={c.bar} radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-muted">
      Sin datos suficientes todavía.
    </div>
  );
}
