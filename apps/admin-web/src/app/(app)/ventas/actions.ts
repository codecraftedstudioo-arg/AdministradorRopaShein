"use server";

import { PERMISOS } from "@shein/shared";
import { ventasService } from "@shein/database";
import { requirePermiso } from "@/auth/guards";
import { parseSalesParams, toVentaDTO } from "@/lib/sales";
import type { VentaDTO } from "@/types/sales";

/** Devuelve TODAS las ventas del set filtrado (para exportar Excel/CSV/PDF). */
export async function exportarVentas(
  sp: Record<string, string | undefined>,
): Promise<VentaDTO[]> {
  await requirePermiso(PERMISOS.VENTAS_VER);
  const { filtros, orden } = parseSalesParams(sp);
  const rows = await ventasService.listarTodo(filtros, {
    orderBy: orden.orderBy,
    orderDir: orden.orderDir,
  });
  return rows.map(toVentaDTO);
}
