"use server";

import { revalidatePath } from "next/cache";
import {
  crearLoteSchema,
  editarLoteSchema,
  crearProveedorSchema,
  PERMISOS,
  ENTIDAD_AUDITORIA,
  ACCION_AUDITORIA,
} from "@shein/shared";
import {
  lotesService,
  proveedoresService,
  auditoriaService,
} from "@shein/database";
import { requirePermiso } from "@/auth/guards";
import { logger } from "@/logger";

export interface ActionResult {
  ok: boolean;
  id?: string;
  error?: string;
}

function revalidar() {
  revalidatePath("/inventario/lotes");
  revalidatePath("/inventario/prendas");
  revalidatePath("/inventario/prendas/nueva");
}

export async function crearProveedor(input: unknown): Promise<ActionResult> {
  const actor = await requirePermiso(PERMISOS.PROVEEDORES_ADMINISTRAR);
  const parsed = crearProveedorSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  try {
    if (await proveedoresService.nombreEnUso(parsed.data.nombre)) {
      return { ok: false, error: "Ya existe un proveedor con ese nombre." };
    }
    const p = await proveedoresService.crear(parsed.data.nombre);
    await auditoriaService.registrar({
      usuarioId: actor.id,
      entidad: ENTIDAD_AUDITORIA.PROVEEDOR,
      entidadId: p.id,
      accion: ACCION_AUDITORIA.CREAR,
      valorNuevo: { nombre: p.nombre },
    });
    revalidar();
    return { ok: true, id: p.id };
  } catch (error) {
    logger.error("Error al crear proveedor", error);
    return { ok: false, error: "No se pudo crear el proveedor." };
  }
}

export async function crearLote(input: unknown): Promise<ActionResult> {
  const actor = await requirePermiso(PERMISOS.LOTES_ADMINISTRAR);
  const parsed = crearLoteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  try {
    const d = parsed.data;
    const lote = await lotesService.crear({
      numero: d.numero || undefined,
      proveedorId: d.proveedorId,
      fechaIngreso: d.fechaIngreso ? new Date(d.fechaIngreso) : undefined,
      observaciones: d.observaciones || undefined,
    });
    await auditoriaService.registrar({
      usuarioId: actor.id,
      entidad: ENTIDAD_AUDITORIA.LOTE,
      entidadId: lote.id,
      accion: ACCION_AUDITORIA.CREAR,
      valorNuevo: { numero: lote.numero, proveedorId: lote.proveedorId },
    });
    revalidar();
    return { ok: true, id: lote.id };
  } catch (error) {
    if (error instanceof Error && error.message === "LOTE_NUMERO_DUPLICADO") {
      return { ok: false, error: "Ese número de lote ya existe." };
    }
    logger.error("Error al crear lote", error);
    return { ok: false, error: "No se pudo crear el lote." };
  }
}

export async function actualizarLote(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  const actor = await requirePermiso(PERMISOS.LOTES_ADMINISTRAR);
  const parsed = editarLoteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  try {
    const d = parsed.data;
    await lotesService.actualizar(id, {
      proveedorId: d.proveedorId,
      fechaIngreso: d.fechaIngreso ? new Date(d.fechaIngreso) : undefined,
      observaciones: d.observaciones || undefined,
    });
    await auditoriaService.registrar({
      usuarioId: actor.id,
      entidad: ENTIDAD_AUDITORIA.LOTE,
      entidadId: id,
      accion: ACCION_AUDITORIA.EDITAR,
      valorNuevo: { proveedorId: d.proveedorId },
    });
    revalidar();
    return { ok: true, id };
  } catch (error) {
    logger.error("Error al actualizar lote", error);
    return { ok: false, error: "No se pudo guardar el lote." };
  }
}
