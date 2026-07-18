// Servicio de acceso a datos: Lotes.
// Cantidad de productos y costo promedio se CALCULAN (nunca se desincronizan).
import type { Prisma } from "@prisma/client";
import { LOTE_PREFIJO } from "@shein/shared";
import { prisma } from "../client";

const LISTA_INCLUDE = {
  proveedor: { select: { id: true, nombre: true } },
  _count: { select: { prendas: { where: { deletedAt: null } } } },
} satisfies Prisma.LoteInclude;

export type LoteLista = Prisma.LoteGetPayload<{ include: typeof LISTA_INCLUDE }> & {
  costoPromedio: number;
  cantidadProductos: number;
};

export type LoteDetalle = LoteLista;

export interface CrearLoteData {
  numero?: string;
  proveedorId: string;
  fechaIngreso?: Date;
  observaciones?: string;
}

export interface ActualizarLoteData {
  proveedorId: string;
  fechaIngreso?: Date;
  observaciones?: string;
}

async function enriquecer(
  lote: Prisma.LoteGetPayload<{ include: typeof LISTA_INCLUDE }>,
): Promise<LoteLista> {
  const agg = await prisma.prenda.aggregate({
    where: { loteId: lote.id, deletedAt: null },
    _avg: { costo: true },
  });
  return {
    ...lote,
    cantidadProductos: lote._count.prendas,
    costoPromedio: Math.round(agg._avg.costo ?? 0),
  };
}

export const lotesService = {
  async listar(): Promise<LoteLista[]> {
    const lotes = await prisma.lote.findMany({
      where: { deletedAt: null },
      include: LISTA_INCLUDE,
      orderBy: { fechaIngreso: "desc" },
    });
    return Promise.all(lotes.map(enriquecer));
  },

  /** Opciones livianas para selects del formulario de prendas. */
  listarOpciones() {
    return prisma.lote.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        numero: true,
        proveedor: { select: { id: true, nombre: true } },
      },
      orderBy: { numero: "asc" },
    });
  },

  async buscarPorId(id: string): Promise<LoteDetalle | null> {
    const lote = await prisma.lote.findFirst({
      where: { id, deletedAt: null },
      include: LISTA_INCLUDE,
    });
    if (!lote) return null;
    return enriquecer(lote);
  },

  async numeroEnUso(numero: string, exceptoId?: string): Promise<boolean> {
    const existente = await prisma.lote.findFirst({
      where: {
        numero,
        ...(exceptoId ? { NOT: { id: exceptoId } } : {}),
      },
      select: { id: true },
    });
    return existente !== null;
  },

  async generarNumero(): Promise<string> {
    const count = await prisma.lote.count();
    let n = count + 1;
    for (let i = 0; i < 20; i++) {
      const numero = `${LOTE_PREFIJO}${String(n).padStart(3, "0")}`;
      if (!(await this.numeroEnUso(numero))) return numero;
      n++;
    }
    return `${LOTE_PREFIJO}${Date.now().toString().slice(-6)}`;
  },

  async crear(data: CrearLoteData) {
    const numero = data.numero?.trim() || (await this.generarNumero());
    if (await this.numeroEnUso(numero)) {
      throw new Error("LOTE_NUMERO_DUPLICADO");
    }
    const lote = await prisma.lote.create({
      data: {
        numero,
        proveedorId: data.proveedorId,
        fechaIngreso: data.fechaIngreso ?? new Date(),
        observaciones: data.observaciones || null,
      },
      include: LISTA_INCLUDE,
    });
    return enriquecer(lote);
  },

  async actualizar(id: string, data: ActualizarLoteData) {
    const lote = await prisma.lote.update({
      where: { id },
      data: {
        proveedorId: data.proveedorId,
        ...(data.fechaIngreso ? { fechaIngreso: data.fechaIngreso } : {}),
        observaciones: data.observaciones || null,
      },
      include: LISTA_INCLUDE,
    });
    return enriquecer(lote);
  },
};
