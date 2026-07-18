import type { Metadata } from "next";
import { lotesService, proveedoresService } from "@shein/database";
import { PERMISOS } from "@shein/shared";
import { requirePermiso } from "@/auth/guards";
import { PageHeader } from "@/components/layout/PageHeader";
import { LotesManager } from "@/components/inventory/LotesManager";

export const metadata: Metadata = { title: "Lotes · Inventario" };

export default async function LotesPage() {
  await requirePermiso(PERMISOS.LOTES_VER);
  const [lotes, proveedores] = await Promise.all([
    lotesService.listar(),
    proveedoresService.listar(false),
  ]);

  return (
    <div>
      <PageHeader
        title="Lotes y proveedores"
        description="Cada lote agrupa prendas de un mismo ingreso. Cantidad y costo promedio se calculan automáticamente."
      />
      <LotesManager
        lotes={lotes.map((l) => ({
          id: l.id,
          numero: l.numero,
          proveedorId: l.proveedorId,
          proveedor: l.proveedor.nombre,
          fechaIngreso: l.fechaIngreso.toISOString(),
          observaciones: l.observaciones,
          cantidadProductos: l.cantidadProductos,
          costoPromedio: l.costoPromedio,
        }))}
        proveedores={proveedores.map((p) => ({
          id: p.id,
          nombre: p.nombre,
        }))}
      />
    </div>
  );
}
