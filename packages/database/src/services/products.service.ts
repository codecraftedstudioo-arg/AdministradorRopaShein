// Servicio de acceso a datos: Prendas (unidades únicas del inventario).
// Cada prenda = 1 bolsa SHEIN. Stock implícito = 1.
// SKU (codigoInterno) inmutable formato LS-000001.
// Nunca elimina físicamente (deletedAt / estado ARCHIVADA).
import type { Prisma, Categoria, Estado, Genero } from "@prisma/client";
import {
  CATEGORIA_LABELS,
  ESTADO_LABELS,
  GENERO_LABELS,
  SKU_PREFIJO,
} from "@shein/shared";
import { prisma } from "../client";

const LOTE_SELECT = {
  id: true,
  numero: true,
  proveedor: { select: { id: true, nombre: true } },
} satisfies Prisma.LoteSelect;

const LISTA_SELECT = {
  id: true,
  codigoInterno: true,
  nombre: true,
  categoria: true,
  subcategoria: true,
  genero: true,
  talle: true,
  precioVenta: true,
  costo: true,
  estado: true,
  fechaIngreso: true,
  createdAt: true,
  lote: { select: LOTE_SELECT },
  usuarioCarga: { select: { id: true, nombre: true, apellido: true } },
  imagenes: {
    where: { esPrincipal: true },
    take: 1,
    select: { url: true },
  },
} satisfies Prisma.PrendaSelect;

export type PrendaLista = Prisma.PrendaGetPayload<{ select: typeof LISTA_SELECT }>;

const DETALLE_INCLUDE = {
  lote: { select: LOTE_SELECT },
  usuarioCarga: {
    select: { id: true, nombre: true, apellido: true, email: true },
  },
  imagenes: { orderBy: { orden: "asc" as const } },
  venta: {
    include: {
      usuario: { select: { id: true, nombre: true, apellido: true } },
    },
  },
} satisfies Prisma.PrendaInclude;

export type PrendaDetalle = Prisma.PrendaGetPayload<{
  include: typeof DETALLE_INCLUDE;
}>;

export interface FiltrosPrenda {
  search?: string;
  categoria?: string;
  subcategoria?: string;
  genero?: string;
  talle?: string;
  estado?: string;
  estados?: string[];
  usuarioId?: string;
  loteId?: string;
  proveedorId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  precioMin?: number;
  precioMax?: number;
}

export type OrdenPrenda =
  | "fechaIngreso"
  | "nombre"
  | "precioVenta"
  | "categoria"
  | "codigoInterno"
  | "estado";

export interface OpcionesLista {
  orderBy?: OrdenPrenda;
  orderDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface ImagenData {
  url: string;
  orden: number;
  esPrincipal: boolean;
}

export interface CrearPrendaData {
  nombre: string;
  descripcion?: string;
  observaciones?: string;
  genero: Genero;
  categoria: Categoria;
  subcategoria?: string;
  talle: string;
  precioVenta: number;
  costo: number;
  estado?: Estado;
  loteId: string;
  usuarioCargaId: string;
  imagenes?: ImagenData[];
}

/** El SKU nunca se actualiza. */
export type ActualizarPrendaData = Omit<CrearPrendaData, "usuarioCargaId">;

function enumMatches(q: string, labels: Record<string, string>): string[] {
  const t = q.toLowerCase();
  return Object.entries(labels)
    .filter(([k, v]) => k.toLowerCase().includes(t) || v.toLowerCase().includes(t))
    .map(([k]) => k);
}

function buildWhere(f?: FiltrosPrenda): Prisma.PrendaWhereInput {
  const and: Prisma.PrendaWhereInput[] = [];

  if (f?.search) {
    const q = f.search.trim();
    const or: Prisma.PrendaWhereInput[] = [
      { codigoInterno: { contains: q, mode: "insensitive" } },
      { nombre: { contains: q, mode: "insensitive" } },
      { subcategoria: { contains: q, mode: "insensitive" } },
      { talle: { contains: q, mode: "insensitive" } },
      { lote: { numero: { contains: q, mode: "insensitive" } } },
      { lote: { proveedor: { nombre: { contains: q, mode: "insensitive" } } } },
    ];
    const cats = enumMatches(q, CATEGORIA_LABELS) as Categoria[];
    if (cats.length) or.push({ categoria: { in: cats } });
    const ests = enumMatches(q, ESTADO_LABELS) as Estado[];
    if (ests.length) or.push({ estado: { in: ests } });
    const gens = enumMatches(q, GENERO_LABELS) as Genero[];
    if (gens.length) or.push({ genero: { in: gens } });
    const n = Number(q.replace(/[^0-9.]/g, ""));
    if (q && !Number.isNaN(n) && n > 0) or.push({ precioVenta: n });
    and.push({ OR: or });
  }

  if (f?.categoria) and.push({ categoria: f.categoria as Categoria });
  if (f?.subcategoria)
    and.push({ subcategoria: { contains: f.subcategoria, mode: "insensitive" } });
  if (f?.genero) and.push({ genero: f.genero as Genero });
  if (f?.talle) and.push({ talle: f.talle });
  if (f?.estado) and.push({ estado: f.estado as Estado });
  else if (f?.estados?.length)
    and.push({ estado: { in: f.estados as Estado[] } });
  if (f?.usuarioId) and.push({ usuarioCargaId: f.usuarioId });
  if (f?.loteId) and.push({ loteId: f.loteId });
  if (f?.proveedorId) and.push({ lote: { proveedorId: f.proveedorId } });
  if (f?.precioMin != null) and.push({ precioVenta: { gte: f.precioMin } });
  if (f?.precioMax != null) and.push({ precioVenta: { lte: f.precioMax } });
  if (f?.fechaDesde) and.push({ fechaIngreso: { gte: new Date(f.fechaDesde) } });
  if (f?.fechaHasta) and.push({ fechaIngreso: { lte: new Date(f.fechaHasta) } });

  return { deletedAt: null, ...(and.length ? { AND: and } : {}) };
}

function normalizarImagenes(imagenes: ImagenData[]): ImagenData[] {
  if (imagenes.length === 0) return [];
  const tienePrincipal = imagenes.some((i) => i.esPrincipal);
  return imagenes.map((img, i) => ({
    url: img.url,
    orden: img.orden ?? i,
    esPrincipal: tienePrincipal ? img.esPrincipal : i === 0,
  }));
}

export const prendasService = {
  async listar(filtros?: FiltrosPrenda, opciones?: OpcionesLista) {
    const page = Math.max(1, opciones?.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, opciones?.pageSize ?? 20));
    const orderBy = opciones?.orderBy ?? "fechaIngreso";
    const orderDir = opciones?.orderDir ?? "desc";
    const where = buildWhere(filtros);

    const [items, total] = await prisma.$transaction([
      prisma.prenda.findMany({
        where,
        select: LISTA_SELECT,
        orderBy: { [orderBy]: orderDir },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.prenda.count({ where }),
    ]);

    return { items, total, page, pageSize };
  },

  buscarPorId(id: string): Promise<PrendaDetalle | null> {
    return prisma.prenda.findFirst({
      where: { id, deletedAt: null },
      include: DETALLE_INCLUDE,
    });
  },

  async codigoEnUso(codigo: string): Promise<boolean> {
    const existente = await prisma.prenda.findFirst({
      where: { codigoInterno: codigo },
      select: { id: true },
    });
    return existente !== null;
  },

  /** Genera el próximo SKU inmutable LS-000001. */
  async generarSku(): Promise<string> {
    const count = await prisma.prenda.count();
    let n = count + 1;
    for (let i = 0; i < 20; i++) {
      const codigo = `${SKU_PREFIJO}-${String(n).padStart(6, "0")}`;
      if (!(await this.codigoEnUso(codigo))) return codigo;
      n++;
    }
    return `${SKU_PREFIJO}-${Date.now()}`;
  },

  async crear(data: CrearPrendaData): Promise<PrendaDetalle> {
    const codigo = await this.generarSku();
    const imagenes = normalizarImagenes(data.imagenes ?? []);
    return prisma.prenda.create({
      data: {
        codigoInterno: codigo,
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        observaciones: data.observaciones || null,
        genero: data.genero,
        categoria: data.categoria,
        subcategoria: data.subcategoria || null,
        talle: data.talle,
        precioVenta: data.precioVenta,
        costo: data.costo,
        estado: data.estado ?? "DISPONIBLE",
        loteId: data.loteId,
        usuarioCargaId: data.usuarioCargaId,
        imagenes: imagenes.length ? { create: imagenes } : undefined,
      },
      include: DETALLE_INCLUDE,
    });
  },

  async actualizar(
    id: string,
    data: ActualizarPrendaData,
  ): Promise<PrendaDetalle> {
    const imagenes =
      data.imagenes !== undefined
        ? normalizarImagenes(data.imagenes)
        : undefined;

    // Nunca se toca codigoInterno (SKU inmutable).
    return prisma.prenda.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        observaciones: data.observaciones || null,
        genero: data.genero,
        categoria: data.categoria,
        subcategoria: data.subcategoria || null,
        talle: data.talle,
        precioVenta: data.precioVenta,
        costo: data.costo,
        loteId: data.loteId,
        ...(data.estado ? { estado: data.estado } : {}),
        ...(imagenes
          ? { imagenes: { deleteMany: {}, create: imagenes } }
          : {}),
      },
      include: DETALLE_INCLUDE,
    });
  },

  cambiarEstado(id: string, estado: Estado): Promise<PrendaDetalle> {
    return prisma.prenda.update({
      where: { id },
      data: { estado },
      include: DETALLE_INCLUDE,
    });
  },

  archivar(id: string): Promise<PrendaDetalle> {
    return this.cambiarEstado(id, "ARCHIVADA");
  },

  reservar(id: string): Promise<PrendaDetalle> {
    return this.cambiarEstado(id, "RESERVADA");
  },

  liberar(id: string): Promise<PrendaDetalle> {
    return this.cambiarEstado(id, "DISPONIBLE");
  },

  async duplicar(
    id: string,
    usuarioCargaId: string,
  ): Promise<PrendaDetalle | null> {
    const original = await prisma.prenda.findFirst({
      where: { id, deletedAt: null },
      include: { imagenes: { orderBy: { orden: "asc" } } },
    });
    if (!original) return null;

    return this.crear({
      nombre: `${original.nombre} (copia)`,
      descripcion: original.descripcion ?? undefined,
      observaciones: original.observaciones ?? undefined,
      genero: original.genero,
      categoria: original.categoria,
      subcategoria: original.subcategoria ?? undefined,
      talle: original.talle,
      precioVenta: original.precioVenta,
      costo: original.costo,
      estado: "DISPONIBLE",
      loteId: original.loteId,
      usuarioCargaId,
      imagenes: original.imagenes.map((img) => ({
        url: img.url,
        orden: img.orden,
        esPrincipal: img.esPrincipal,
      })),
    });
  },

  async metricasDashboard() {
    const activos: Estado[] = ["DISPONIBLE", "RESERVADA"];
    const [
      total,
      disponibles,
      reservadas,
      vendidas,
      archivadas,
      agg,
      ultimas,
    ] = await prisma.$transaction([
      prisma.prenda.count({ where: { deletedAt: null } }),
      prisma.prenda.count({ where: { deletedAt: null, estado: "DISPONIBLE" } }),
      prisma.prenda.count({ where: { deletedAt: null, estado: "RESERVADA" } }),
      prisma.prenda.count({ where: { deletedAt: null, estado: "VENDIDA" } }),
      prisma.prenda.count({ where: { deletedAt: null, estado: "ARCHIVADA" } }),
      prisma.prenda.aggregate({
        where: { deletedAt: null, estado: { in: activos } },
        _sum: { precioVenta: true },
        _avg: { precioVenta: true },
      }),
      prisma.prenda.findMany({
        where: { deletedAt: null },
        select: LISTA_SELECT,
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

    return {
      total,
      disponibles,
      reservadas,
      vendidas,
      archivadas,
      valorInventario: agg._sum.precioVenta ?? 0,
      precioPromedio: Math.round(agg._avg.precioVenta ?? 0),
      ultimas,
    };
  },

  async opcionesFiltro() {
    const [subs, talles] = await Promise.all([
      prisma.prenda.findMany({
        where: { deletedAt: null, subcategoria: { not: null } },
        select: { subcategoria: true },
        distinct: ["subcategoria"],
      }),
      prisma.prenda.findMany({
        where: { deletedAt: null },
        select: { talle: true },
        distinct: ["talle"],
      }),
    ]);
    return {
      subcategorias: subs
        .map((s) => s.subcategoria)
        .filter((v): v is string => Boolean(v))
        .sort(),
      talles: talles.map((t) => t.talle).sort(),
    };
  },
};
