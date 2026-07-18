"use server";

import { revalidatePath } from "next/cache";
import {
  PERMISOS,
  validarImportacion,
  type FilaMapeada,
  type FilaValidada,
  type CampoImportacion,
} from "@shein/shared";
import { importService } from "@shein/database";
import { requirePermiso } from "@/auth/guards";
import { logger } from "@/logger";

export interface ImportContextDTO {
  skus: string[];
  lotes: { numero: string; proveedorNombre: string }[];
}

export async function obtenerContextoImportacion(): Promise<ImportContextDTO> {
  await requirePermiso(PERMISOS.PRENDAS_IMPORTAR);
  const [skus, lotesMap] = await Promise.all([
    importService.listarSkus(),
    importService.mapLotes(),
  ]);
  const lotes: { numero: string; proveedorNombre: string }[] = [];
  const vistos = new Set<string>();
  for (const [numero, info] of lotesMap) {
    if (vistos.has(info.id)) continue;
    vistos.add(info.id);
    lotes.push({ numero, proveedorNombre: info.proveedorNombre });
  }
  return { skus, lotes };
}

export async function validarFilasImportacion(filas: FilaMapeada[]) {
  await requirePermiso(PERMISOS.PRENDAS_IMPORTAR);
  const [skus, lotesMap] = await Promise.all([
    importService.listarSkus(),
    importService.mapLotes(),
  ]);
  return validarImportacion(filas, {
    skusExistentes: new Set(skus.map((s) => s.toUpperCase())),
    lotes: lotesMap,
  });
}

export async function ejecutarImportacion(input: {
  archivoNombre: string;
  formato: string;
  filas: FilaValidada[];
}) {
  const actor = await requirePermiso(PERMISOS.PRENDAS_IMPORTAR);

  if (!input.filas.length) {
    return { ok: false as const, error: "No hay filas válidas para importar." };
  }

  // Re-validar en servidor antes de persistir.
  const [skus, lotesMap] = await Promise.all([
    importService.listarSkus(),
    importService.mapLotes(),
  ]);

  // Reconstruir FilaMapeada mínima para re-validar (ya vienen validadas,
  // pero chequeamos SKUs/lotes frescos).
  const recheck = validarImportacion(
    input.filas.map((f) => ({
      fila: f.fila,
      sku: f.sku ?? "",
      lote: f.loteNumero,
      proveedor: f.proveedorNombre ?? "",
      nombre: f.nombre,
      categoria: f.categoria,
      subcategoria: f.subcategoria ?? "",
      genero: f.genero,
      talle: f.talle,
      precio: String(f.precioVenta),
      costo: String(f.costo),
      estado: f.estado,
      descripcion: f.descripcion ?? "",
      observaciones: f.observaciones ?? "",
    })),
    {
      skusExistentes: new Set(skus.map((s) => s.toUpperCase())),
      lotes: lotesMap,
    },
  );

  const errores = recheck.issues.filter((i) => i.severidad === "error");
  if (errores.length > 0) {
    return {
      ok: false as const,
      error: `Hay ${errores.length} error(es) de validación. Corregí el archivo e intentá de nuevo.`,
      issues: errores,
    };
  }

  try {
    const resultado = await importService.importarPrendas({
      usuarioId: actor.id,
      archivoNombre: input.archivoNombre,
      formato: input.formato,
      filas: recheck.validas,
    });

    revalidatePath("/inventario");
    revalidatePath("/inventario/prendas");
    revalidatePath("/inventario/importar");
    revalidatePath("/archivo");

    return resultado;
  } catch (error) {
    logger.error("Error en importación masiva", error);
    return {
      ok: false as const,
      error: "No se pudo completar la importación.",
    };
  }
}

/** Verifica que el mapeo cubra los campos requeridos. */
export async function verificarMapeo(
  mapeo: Record<string, CampoImportacion | "">,
) {
  await requirePermiso(PERMISOS.PRENDAS_IMPORTAR);
  const { CAMPOS_REQUERIDOS, CAMPO_IMPORTACION_LABELS } = await import(
    "@shein/shared"
  );
  const usados = new Set(Object.values(mapeo).filter(Boolean));
  const faltantes = CAMPOS_REQUERIDOS.filter((c) => !usados.has(c));
  return {
    ok: faltantes.length === 0,
    faltantes: faltantes.map((c) => CAMPO_IMPORTACION_LABELS[c]),
  };
}
