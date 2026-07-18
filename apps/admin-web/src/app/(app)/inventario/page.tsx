import type { Metadata } from "next";
import Link from "next/link";
import {
  Package,
  CheckCircle2,
  ShoppingBag,
  Archive,
  Wallet,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import { prendasService, auditoriaService } from "@shein/database";
import {
  PERMISOS,
  ENTIDAD_AUDITORIA,
  ACCION_AUDITORIA_LABELS,
  tienePermiso,
} from "@shein/shared";
import { requirePermiso } from "@/auth/guards";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent, LinkButton } from "@/components/ui";
import { MetricCard } from "@/components/inventory/MetricCard";
import { EstadoBadge } from "@/components/inventory/EstadoBadge";
import { Thumbnail } from "@/components/inventory/Thumbnail";
import { toListaDTO } from "@/lib/inventory";
import { formatMoney, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Inventario" };

export default async function InventarioDashboardPage() {
  const sesion = await requirePermiso(PERMISOS.PRENDAS_VER);
  const puedeCrear = tienePermiso(sesion.permisos, PERMISOS.PRENDAS_CREAR);
  const puedeImportar = tienePermiso(sesion.permisos, PERMISOS.PRENDAS_IMPORTAR);

  const [metricas, actividad] = await Promise.all([
    prendasService.metricasDashboard(),
    auditoriaService.listar({ entidad: ENTIDAD_AUDITORIA.PRENDA, pageSize: 8 }),
  ]);

  const ultimas = metricas.ultimas.map(toListaDTO);

  return (
    <div>
      <PageHeader
        title="Inventario"
        description="Resumen de tus prendas únicas provenientes de las Mystery Box."
        action={
          <>
            <LinkButton href="/inventario/prendas" variant="outline">
              Ver listado
            </LinkButton>
            {puedeImportar && (
              <LinkButton href="/inventario/importar" variant="outline">
                Importar
              </LinkButton>
            )}
            {puedeCrear && (
              <LinkButton href="/inventario/prendas/nueva">
                <Plus className="h-4 w-4" />
                Nueva prenda
              </LinkButton>
            )}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Total de prendas" value={metricas.total} icon={Package} />
        <MetricCard
          label="Disponibles"
          value={metricas.disponibles}
          icon={CheckCircle2}
          accent="text-emerald-500"
          hint={`${metricas.reservadas} reservadas`}
        />
        <MetricCard
          label="Vendidas"
          value={metricas.vendidas}
          icon={ShoppingBag}
          accent="text-blue-500"
        />
        <MetricCard
          label="Archivadas"
          value={metricas.archivadas}
          icon={Archive}
        />
        <MetricCard
          label="Valor del inventario"
          value={formatMoney(metricas.valorInventario)}
          icon={Wallet}
          hint="Prendas disponibles y reservadas"
        />
        <MetricCard
          label="Precio promedio"
          value={formatMoney(metricas.precioPromedio)}
          icon={TrendingUp}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Últimas prendas cargadas</CardTitle>
            <Link
              href="/inventario/prendas"
              className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
            >
              Ver todas <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {ultimas.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">
                Todavía no cargaste prendas.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {ultimas.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/inventario/prendas/${p.id}`}
                      className="flex items-center gap-3 py-2.5 transition-colors hover:bg-surface-2/50"
                    >
                      <Thumbnail
                        src={p.imagenPrincipal}
                        alt={p.nombre}
                        className="h-10 w-10 shrink-0 rounded-lg"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.nombre}</p>
                        <p className="font-mono text-xs text-muted">
                          {p.codigoInterno}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {formatMoney(p.precioVenta)}
                      </span>
                      <EstadoBadge estado={p.estado} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            {actividad.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">
                Sin actividad todavía.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {actividad.map((a) => (
                  <li key={a.id} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                    <div className="min-w-0">
                      <p className="text-sm">
                        {ACCION_AUDITORIA_LABELS[a.accion] ?? a.accion}
                      </p>
                      <p className="text-xs text-muted">
                        {a.usuario.nombre} {a.usuario.apellido} · {timeAgo(a.fecha)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
