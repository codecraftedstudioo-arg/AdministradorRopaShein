// Servicio de importación masiva de prendas.
// Transaccional: todo o nada. Reutilizable por web/mobile/API.
import type { Prisma, Categoria, Estado, Genero } from "@prisma/client";
import { SKU_PREFIJO, type FilaValidada } from "@shein/shared";
import { prisma } from "../client";

export interface ImportarPrendasInput {
  usuarioId: string;
  archivoNombre: string;
  formato: string;
  filas: FilaValidada[];
}

export interface ImportarPrendasResultado {
  ok: boolean;
  importacionId: string;
  cantidadImportada: number;
  cantidadRechazada: number;
  cantidadTotal: number;
  duracionMs: number;
  error?: string;
}

async function siguienteSku(
  tx: Prisma.TransactionClient,
  desde: number,
): Promise<{ sku: string; next: number }> {
  let n = desde;
  for (let i = 0; i < 50; i++) {
    const sku = `${SKU_PREFIJO}-${String(n).padStart(6, "0")}`;
    const existe = await tx.prenda.findFirst({
      where: { codigoInterno: sku },
      select: { id: true },
    });
    if (!existe) return { sku, next: n + 1 };
    n++;
  }
  return { sku: `${SKU_PREFIJO}-${Date.now()}`, next: n + 1 };
}

export const importService = {
  /** SKUs existentes (para validación previa). */
  async listarSkus(): Promise<string[]> {
    const rows = await prisma.prenda.findMany({
      select: { codigoInterno: true },
    });
    return rows.map((r) => r.codigoInterno);
  },

  /** Lotes activos indexados por número (upper). */
  async mapLotes() {
    const lotes = await prisma.lote.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        numero: true,
        proveedor: { select: { nombre: true } },
      },
    });
    const map = new Map<string, { id: string; proveedorNombre: string }>();
    for (const l of lotes) {
      map.set(l.numero, {
        id: l.id,
        proveedorNombre: l.proveedor.nombre,
      });
      map.set(l.numero.toUpperCase(), {
        id: l.id,
        proveedorNombre: l.proveedor.nombre,
      });
    }
    return map;
  },

  /**
   * Importa todas las filas en una sola transacción.
   * Si falla cualquier inserción, se revierte todo.
   */
  async importarPrendas(
    input: ImportarPrendasInput,
  ): Promise<ImportarPrendasResultado> {
    const inicio = Date.now();
    const cantidadTotal = input.filas.length;

    try {
      const resultado = await prisma.$transaction(
        async (tx) => {
          const lotes = await tx.lote.findMany({
            where: { deletedAt: null },
            select: {
              id: true,
              numero: true,
              proveedor: { select: { nombre: true } },
            },
          });
          const loteByNumero = new Map(
            lotes.flatMap((l) => [
              [l.numero, l] as const,
              [l.numero.toUpperCase(), l] as const,
            ]),
          );

          const countInicial = await tx.prenda.count();
          let nextSku = countInicial + 1;
          const creadas: string[] = [];

          for (const fila of input.filas) {
            const lote =
              loteByNumero.get(fila.loteNumero) ??
              loteByNumero.get(fila.loteNumero.toUpperCase());
            if (!lote) {
              throw new Error(`LOTE_NO_ENCONTRADO:${fila.loteNumero}`);
            }

            let sku = fila.sku?.trim() || null;
            if (sku) {
              const dup = await tx.prenda.findFirst({
                where: { codigoInterno: sku },
                select: { id: true },
              });
              if (dup) throw new Error(`SKU_DUPLICADO:${sku}`);
            } else {
              const gen = await siguienteSku(tx, nextSku);
              sku = gen.sku;
              nextSku = gen.next;
            }

            const prenda = await tx.prenda.create({
              data: {
                codigoInterno: sku,
                nombre: fila.nombre,
                descripcion: fila.descripcion,
                observaciones: fila.observaciones,
                genero: fila.genero as Genero,
                categoria: fila.categoria as Categoria,
                subcategoria: fila.subcategoria,
                talle: fila.talle,
                precioVenta: fila.precioVenta,
                costo: fila.costo,
                estado: fila.estado as Estado,
                loteId: lote.id,
                usuarioCargaId: input.usuarioId,
              },
              select: { id: true },
            });
            creadas.push(prenda.id);
          }

          const duracionMs = Date.now() - inicio;
          const importacion = await tx.importacion.create({
            data: {
              usuarioId: input.usuarioId,
              archivoNombre: input.archivoNombre,
              formato: input.formato,
              cantidadTotal,
              cantidadImportada: creadas.length,
              cantidadRechazada: 0,
              duracionMs,
              estado: "COMPLETADA",
              detalle: { prendaIds: creadas.slice(0, 100) },
            },
          });

          await tx.auditoria.create({
            data: {
              usuarioId: input.usuarioId,
              entidad: "Importacion",
              entidadId: importacion.id,
              accion: "IMPORTAR",
              valorNuevo: {
                archivo: input.archivoNombre,
                cantidad: creadas.length,
              },
            },
          });

          return {
            importacionId: importacion.id,
            cantidadImportada: creadas.length,
            duracionMs,
          };
        },
        {
          // Archivos grandes: hasta 2 minutos.
          timeout: 120_000,
          maxWait: 15_000,
        },
      );

      return {
        ok: true,
        importacionId: resultado.importacionId,
        cantidadImportada: resultado.cantidadImportada,
        cantidadRechazada: 0,
        cantidadTotal,
        duracionMs: resultado.duracionMs,
      };
    } catch (error) {
      const duracionMs = Date.now() - inicio;
      const mensaje =
        error instanceof Error ? error.message : "Error desconocido";

      // Registrar fallo fuera de la tx (la tx ya revirtió).
      const fallida = await prisma.importacion.create({
        data: {
          usuarioId: input.usuarioId,
          archivoNombre: input.archivoNombre,
          formato: input.formato,
          cantidadTotal,
          cantidadImportada: 0,
          cantidadRechazada: cantidadTotal,
          duracionMs,
          estado: "FALLIDA",
          detalle: { error: mensaje },
        },
      });

      return {
        ok: false,
        importacionId: fallida.id,
        cantidadImportada: 0,
        cantidadRechazada: cantidadTotal,
        cantidadTotal,
        duracionMs,
        error: mensaje.startsWith("SKU_DUPLICADO")
          ? `SKU duplicado detectado durante la importación.`
          : mensaje.startsWith("LOTE_NO_ENCONTRADO")
            ? `Un lote referenciado ya no existe.`
            : "No se pudo completar la importación. No se guardó ningún producto.",
      };
    }
  },

  listarHistorial(page = 1, pageSize = 20) {
    return prisma.importacion.findMany({
      include: {
        usuario: { select: { id: true, nombre: true, apellido: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  },
};
