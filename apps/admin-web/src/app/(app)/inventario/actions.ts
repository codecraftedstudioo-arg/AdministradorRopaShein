"use server";

import { revalidatePath } from "next/cache";
import {
  crearPrendaSchema,
  editarPrendaSchema,
  registrarVentaSchema,
  PERMISOS,
  ENTIDAD_AUDITORIA,
  ACCION_AUDITORIA,
} from "@shein/shared";
import { prendasService, ventasService, auditoriaService } from "@shein/database";
import { requirePermiso } from "@/auth/guards";
import { logger } from "@/logger";

export interface PrendaActionResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export interface VentaActionResult {
  ok: boolean;
  error?: string;
}

function revalidarInventario(id?: string) {
  revalidatePath("/inventario");
  revalidatePath("/inventario/prendas");
  revalidatePath("/archivo");
  revalidatePath("/ventas");
  revalidatePath("/ventas/listado");
  revalidatePath("/inventario/lotes");
  if (id) revalidatePath(`/inventario/prendas/${id}`);
}

const MENSAJES_ESTADO_VENTA: Record<string, string> = {
  ESTADO_VENDIDA: "La prenda ya fue vendida.",
  ESTADO_ARCHIVADA: "La prenda está archivada y no puede venderse.",
  PRENDA_NO_ENCONTRADA: "No se encontró la prenda.",
};

function snapshot(data: {
  nombre: string;
  precioVenta: number;
  costo: number;
  estado?: string;
  categoria: string;
  subcategoria?: string;
  talle: string;
  genero: string;
  loteId?: string;
}) {
  return {
    nombre: data.nombre,
    precioVenta: data.precioVenta,
    costo: data.costo,
    categoria: data.categoria,
    subcategoria: data.subcategoria || null,
    talle: data.talle,
    genero: data.genero,
    ...(data.loteId ? { loteId: data.loteId } : {}),
    ...(data.estado ? { estado: data.estado } : {}),
  };
}

export async function crearPrenda(
  input: unknown,
): Promise<PrendaActionResult> {
  const actor = await requirePermiso(PERMISOS.PRENDAS_CREAR);
  const parsed = crearPrendaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const d = parsed.data;
    const prenda = await prendasService.crear({
      nombre: d.nombre,
      descripcion: d.descripcion || undefined,
      observaciones: d.observaciones || undefined,
      genero: d.genero,
      categoria: d.categoria,
      subcategoria: d.subcategoria || undefined,
      talle: d.talle,
      precioVenta: d.precioVenta,
      costo: d.costo,
      estado: d.estado,
      loteId: d.loteId,
      usuarioCargaId: actor.id,
      imagenes: d.imagenes,
    });
    await auditoriaService.registrar({
      usuarioId: actor.id,
      entidad: ENTIDAD_AUDITORIA.PRENDA,
      entidadId: prenda.id,
      accion: ACCION_AUDITORIA.CREAR,
      valorNuevo: {
        ...snapshot({ ...d, estado: prenda.estado }),
        sku: prenda.codigoInterno,
      },
    });
    revalidarInventario(prenda.id);
    return { ok: true, id: prenda.id };
  } catch (error) {
    logger.error("Error al crear prenda", error);
    return { ok: false, error: "No se pudo crear la prenda." };
  }
}

export async function actualizarPrenda(
  id: string,
  input: unknown,
): Promise<PrendaActionResult> {
  const actor = await requirePermiso(PERMISOS.PRENDAS_EDITAR);
  const parsed = editarPrendaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const anterior = await prendasService.buscarPorId(id);
    if (!anterior) return { ok: false, error: "Prenda no encontrada." };

    const d = parsed.data;
    await prendasService.actualizar(id, {
      nombre: d.nombre,
      descripcion: d.descripcion || undefined,
      observaciones: d.observaciones || undefined,
      genero: d.genero,
      categoria: d.categoria,
      subcategoria: d.subcategoria || undefined,
      talle: d.talle,
      precioVenta: d.precioVenta,
      costo: d.costo,
      estado: d.estado,
      loteId: d.loteId,
      imagenes: d.imagenes,
    });
    await auditoriaService.registrar({
      usuarioId: actor.id,
      entidad: ENTIDAD_AUDITORIA.PRENDA,
      entidadId: id,
      accion: ACCION_AUDITORIA.EDITAR,
      valorAnterior: snapshot({
        nombre: anterior.nombre,
        precioVenta: anterior.precioVenta,
        costo: anterior.costo,
        estado: anterior.estado,
        categoria: anterior.categoria,
        subcategoria: anterior.subcategoria ?? undefined,
        talle: anterior.talle,
        genero: anterior.genero,
        loteId: anterior.loteId,
      }),
      valorNuevo: snapshot({ ...d, estado: d.estado ?? anterior.estado }),
    });
    revalidarInventario(id);
    return { ok: true, id };
  } catch (error) {
    logger.error("Error al actualizar prenda", error);
    return { ok: false, error: "No se pudo guardar la prenda." };
  }
}

export async function archivarPrenda(id: string): Promise<PrendaActionResult> {
  const actor = await requirePermiso(PERMISOS.PRENDAS_ARCHIVAR);
  try {
    const anterior = await prendasService.buscarPorId(id);
    if (!anterior) return { ok: false, error: "Prenda no encontrada." };
    if (anterior.estado === "VENDIDA" || anterior.estado === "ARCHIVADA") {
      return { ok: false, error: "La prenda ya no está en inventario activo." };
    }
    await prendasService.archivar(id);
    await auditoriaService.registrar({
      usuarioId: actor.id,
      entidad: ENTIDAD_AUDITORIA.PRENDA,
      entidadId: id,
      accion: ACCION_AUDITORIA.ARCHIVAR,
      valorAnterior: { estado: anterior.estado },
      valorNuevo: { estado: "ARCHIVADA" },
    });
    revalidarInventario(id);
    return { ok: true, id };
  } catch (error) {
    logger.error("Error al archivar prenda", error);
    return { ok: false, error: "No se pudo archivar la prenda." };
  }
}

export async function reservarPrenda(id: string): Promise<PrendaActionResult> {
  const actor = await requirePermiso(PERMISOS.PRENDAS_EDITAR);
  try {
    const anterior = await prendasService.buscarPorId(id);
    if (!anterior) return { ok: false, error: "Prenda no encontrada." };
    if (anterior.estado !== "DISPONIBLE") {
      return { ok: false, error: "Solo se puede reservar una prenda disponible." };
    }
    await prendasService.reservar(id);
    await auditoriaService.registrar({
      usuarioId: actor.id,
      entidad: ENTIDAD_AUDITORIA.PRENDA,
      entidadId: id,
      accion: ACCION_AUDITORIA.RESERVAR,
      valorAnterior: { estado: "DISPONIBLE" },
      valorNuevo: { estado: "RESERVADA" },
    });
    revalidarInventario(id);
    return { ok: true, id };
  } catch (error) {
    logger.error("Error al reservar prenda", error);
    return { ok: false, error: "No se pudo reservar la prenda." };
  }
}

export async function liberarPrenda(id: string): Promise<PrendaActionResult> {
  const actor = await requirePermiso(PERMISOS.PRENDAS_EDITAR);
  try {
    const anterior = await prendasService.buscarPorId(id);
    if (!anterior) return { ok: false, error: "Prenda no encontrada." };
    if (anterior.estado !== "RESERVADA") {
      return { ok: false, error: "Solo se puede liberar una prenda reservada." };
    }
    await prendasService.liberar(id);
    await auditoriaService.registrar({
      usuarioId: actor.id,
      entidad: ENTIDAD_AUDITORIA.PRENDA,
      entidadId: id,
      accion: ACCION_AUDITORIA.LIBERAR,
      valorAnterior: { estado: "RESERVADA" },
      valorNuevo: { estado: "DISPONIBLE" },
    });
    revalidarInventario(id);
    return { ok: true, id };
  } catch (error) {
    logger.error("Error al liberar prenda", error);
    return { ok: false, error: "No se pudo liberar la prenda." };
  }
}

export async function duplicarPrenda(id: string): Promise<PrendaActionResult> {
  const actor = await requirePermiso(PERMISOS.PRENDAS_CREAR);
  try {
    const copia = await prendasService.duplicar(id, actor.id);
    if (!copia) return { ok: false, error: "Prenda no encontrada." };
    await auditoriaService.registrar({
      usuarioId: actor.id,
      entidad: ENTIDAD_AUDITORIA.PRENDA,
      entidadId: copia.id,
      accion: ACCION_AUDITORIA.DUPLICAR,
      valorNuevo: { origen: id, sku: copia.codigoInterno },
    });
    revalidarInventario(copia.id);
    return { ok: true, id: copia.id };
  } catch (error) {
    logger.error("Error al duplicar prenda", error);
    return { ok: false, error: "No se pudo duplicar la prenda." };
  }
}

export async function registrarVenta(
  prendaId: string,
  input: unknown,
): Promise<VentaActionResult> {
  const actor = await requirePermiso(PERMISOS.VENTAS_REGISTRAR);
  const parsed = registrarVentaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const d = parsed.data;
    await ventasService.registrar({
      prendaId,
      usuarioId: actor.id,
      canalVenta: d.canalVenta,
      precioFinal: d.precioFinal,
      observaciones: d.observaciones || undefined,
      fechaVenta: d.fechaVenta ? new Date(d.fechaVenta) : undefined,
    });
    await auditoriaService.registrar({
      usuarioId: actor.id,
      entidad: ENTIDAD_AUDITORIA.PRENDA,
      entidadId: prendaId,
      accion: ACCION_AUDITORIA.VENDER,
      valorNuevo: { canal: d.canalVenta, precioFinal: d.precioFinal },
    });
    revalidarInventario(prendaId);
    return { ok: true };
  } catch (error) {
    const clave = error instanceof Error ? error.message : "";
    const msg = MENSAJES_ESTADO_VENTA[clave] ?? "No se pudo registrar la venta.";
    logger.error("Error al registrar venta", error);
    return { ok: false, error: msg };
  }
}
