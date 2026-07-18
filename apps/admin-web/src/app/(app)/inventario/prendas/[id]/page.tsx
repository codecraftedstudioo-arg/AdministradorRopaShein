import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prendasService, auditoriaService } from "@shein/database";
import {
  PERMISOS,
  CATEGORIA_LABELS,
  GENERO_LABELS,
  CANAL_VENTA_LABELS,
  ENTIDAD_AUDITORIA,
  type CategoriaValor,
  type GeneroValor,
  type CanalVentaValor,
} from "@shein/shared";
import { requirePermiso } from "@/auth/guards";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Gallery } from "@/components/inventory/Gallery";
import { EstadoBadge } from "@/components/inventory/EstadoBadge";
import { Timeline } from "@/components/inventory/Timeline";
import { ProductActions } from "@/components/inventory/ProductActions";
import { formatMoney, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Detalle de prenda" };

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

export default async function DetallePrendaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermiso(PERMISOS.PRENDAS_VER);
  const { id } = await params;

  const [prenda, eventos] = await Promise.all([
    prendasService.buscarPorId(id),
    auditoriaService.listar({
      entidad: ENTIDAD_AUDITORIA.PRENDA,
      entidadId: id,
      pageSize: 50,
    }),
  ]);
  if (!prenda) notFound();

  const ganancia = prenda.precioVenta - prenda.costo;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <Gallery imagenes={prenda.imagenes} alt={prenda.nombre} />
      </div>

      <div className="flex flex-col gap-6 lg:col-span-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {prenda.nombre}
              </h1>
              <EstadoBadge estado={prenda.estado} />
            </div>
            <p className="mt-1 font-mono text-sm text-muted">
              SKU {prenda.codigoInterno}
            </p>
          </div>
        </div>

        <ProductActions
          layout="bar"
          prenda={{
            id: prenda.id,
            nombre: prenda.nombre,
            codigoInterno: prenda.codigoInterno,
            precioVenta: prenda.precioVenta,
            estado: prenda.estado,
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-[var(--border)] pt-0">
            <InfoRow label="SKU" value={prenda.codigoInterno} />
            <InfoRow label="Lote" value={prenda.lote.numero} />
            <InfoRow label="Proveedor" value={prenda.lote.proveedor.nombre} />
            <InfoRow
              label="Categoría"
              value={
                CATEGORIA_LABELS[prenda.categoria as CategoriaValor] ??
                prenda.categoria
              }
            />
            <InfoRow label="Subcategoría" value={prenda.subcategoria ?? "—"} />
            <InfoRow
              label="Género"
              value={
                GENERO_LABELS[prenda.genero as GeneroValor] ?? prenda.genero
              }
            />
            <InfoRow label="Talle" value={prenda.talle} />
            <InfoRow
              label="Precio de venta"
              value={formatMoney(prenda.precioVenta)}
            />
            <InfoRow label="Costo" value={formatMoney(prenda.costo)} />
            <InfoRow
              label="Ganancia estimada"
              value={
                <span
                  className={
                    ganancia >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }
                >
                  {formatMoney(ganancia)}
                </span>
              }
            />
            <InfoRow
              label="Cargada por"
              value={`${prenda.usuarioCarga.nombre} ${prenda.usuarioCarga.apellido}`}
            />
            <InfoRow
              label="Fecha de ingreso"
              value={formatDate(prenda.fechaIngreso, true)}
            />
            <InfoRow
              label="Última modificación"
              value={formatDate(prenda.updatedAt, true)}
            />
          </CardContent>
        </Card>

        {prenda.descripcion && (
          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm text-muted">
                {prenda.descripcion}
              </p>
            </CardContent>
          </Card>
        )}

        {prenda.observaciones && (
          <Card>
            <CardHeader>
              <CardTitle>Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm text-muted">
                {prenda.observaciones}
              </p>
            </CardContent>
          </Card>
        )}

        {prenda.venta && (
          <Card>
            <CardHeader>
              <CardTitle>Venta</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-[var(--border)] pt-0">
              <InfoRow
                label="Canal"
                value={
                  CANAL_VENTA_LABELS[
                    prenda.venta.canalVenta as CanalVentaValor
                  ] ?? prenda.venta.canalVenta
                }
              />
              <InfoRow
                label="Precio final"
                value={formatMoney(prenda.venta.precioFinal)}
              />
              <InfoRow
                label="Fecha"
                value={formatDate(prenda.venta.fechaVenta, true)}
              />
              <InfoRow
                label="Registrada por"
                value={`${prenda.venta.usuario.nombre} ${prenda.venta.usuario.apellido}`}
              />
              {prenda.venta.observaciones && (
                <InfoRow
                  label="Observaciones"
                  value={prenda.venta.observaciones}
                />
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Historial</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline
              eventos={eventos.map((e) => ({
                id: e.id,
                accion: e.accion,
                usuario: `${e.usuario.nombre} ${e.usuario.apellido}`,
                fecha: e.fecha.toISOString(),
              }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
