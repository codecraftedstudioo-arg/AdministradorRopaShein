import type { Metadata } from "next";
import { ventasService, usuariosService } from "@shein/database";
import { PERMISOS } from "@shein/shared";
import { requirePermiso } from "@/auth/guards";
import { PageHeader } from "@/components/layout/PageHeader";
import { LinkButton } from "@/components/ui";
import { SalesView } from "@/components/sales/SalesView";
import { parseSalesParams, toVentaDTO, PAGE_SIZE } from "@/lib/sales";

export const metadata: Metadata = { title: "Registros de ventas" };

export default async function VentasListadoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermiso(PERMISOS.VENTAS_VER);
  const sp = await searchParams;
  const { filtros, orden, page, raw } = parseSalesParams(sp);

  const [resultado, usuarios] = await Promise.all([
    ventasService.listar(filtros, {
      orderBy: orden.orderBy,
      orderDir: orden.orderDir,
      page,
      pageSize: PAGE_SIZE,
    }),
    usuariosService.listar(),
  ]);

  return (
    <div>
      <PageHeader
        title="Registros de ventas"
        description="Todas las ventas realizadas. La información nunca se elimina."
        action={
          <LinkButton href="/ventas" variant="outline">
            Ver dashboard
          </LinkButton>
        }
      />
      <SalesView
        items={resultado.items.map(toVentaDTO)}
        total={resultado.total}
        page={resultado.page}
        pageSize={resultado.pageSize}
        params={raw}
        opciones={{
          vendedores: usuarios.map((u) => ({
            id: u.id,
            nombre: `${u.nombre} ${u.apellido}`,
          })),
        }}
      />
    </div>
  );
}
