import type { Metadata } from "next";
import {
  prendasService,
  usuariosService,
  lotesService,
  proveedoresService,
} from "@shein/database";
import { PERMISOS, ESTADOS_ACTIVOS } from "@shein/shared";
import { requirePermiso } from "@/auth/guards";
import { PageHeader } from "@/components/layout/PageHeader";
import { InventoryView } from "@/components/inventory/InventoryView";
import { parseInventoryParams, toListaDTO, PAGE_SIZE } from "@/lib/inventory";

export const metadata: Metadata = { title: "Prendas · Inventario" };

export default async function ListadoPrendasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermiso(PERMISOS.PRENDAS_VER);
  const sp = await searchParams;
  const { filtros, orden, page, raw } = parseInventoryParams(sp, ESTADOS_ACTIVOS);

  const [resultado, opcionesFiltro, usuarios, lotes, proveedores] =
    await Promise.all([
      prendasService.listar(filtros, {
        orderBy: orden.orderBy,
        orderDir: orden.orderDir,
        page,
        pageSize: PAGE_SIZE,
      }),
      prendasService.opcionesFiltro(),
      usuariosService.listar(),
      lotesService.listarOpciones(),
      proveedoresService.listar(),
    ]);

  return (
    <div>
      <PageHeader
        title="Prendas"
        description="Cada bolsa SHEIN es una prenda única (stock = 1)."
      />
      <InventoryView
        items={resultado.items.map(toListaDTO)}
        total={resultado.total}
        page={resultado.page}
        pageSize={resultado.pageSize}
        params={raw}
        estadosFiltro={ESTADOS_ACTIVOS}
        opciones={{
          subcategorias: opcionesFiltro.subcategorias,
          talles: opcionesFiltro.talles,
          usuarios: usuarios.map((u) => ({
            id: u.id,
            nombre: `${u.nombre} ${u.apellido}`,
          })),
          lotes: lotes.map((l) => ({
            id: l.id,
            numero: l.numero,
            proveedor: l.proveedor.nombre,
            proveedorId: l.proveedor.id,
          })),
          proveedores: proveedores.map((p) => ({
            id: p.id,
            nombre: p.nombre,
          })),
        }}
      />
    </div>
  );
}
