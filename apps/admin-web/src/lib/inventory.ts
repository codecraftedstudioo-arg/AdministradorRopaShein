import type {
  FiltrosPrenda,
  OrdenPrenda,
  PrendaLista,
} from "@shein/database";
import type { EstadoValor } from "@shein/shared";
import type { PrendaListaDTO } from "@/types/inventory";
import type { InventoryParams } from "@/components/inventory/InventoryView";

const ORDENES_VALIDOS: OrdenPrenda[] = [
  "fechaIngreso",
  "nombre",
  "precioVenta",
  "categoria",
  "codigoInterno",
  "estado",
];

export const PAGE_SIZE = 20;

type SearchParamsRaw = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.length > 0 ? s : undefined;
}

function num(v: string | string[] | undefined): number | undefined {
  const s = str(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isNaN(n) ? undefined : n;
}

export function parseInventoryParams(
  sp: SearchParamsRaw,
  estadosPermitidos: EstadoValor[],
) {
  const estadoRaw = str(sp.estado);
  const estado =
    estadoRaw && estadosPermitidos.includes(estadoRaw as EstadoValor)
      ? estadoRaw
      : undefined;
  const hasta = str(sp.hasta);

  const filtros: FiltrosPrenda = {
    search: str(sp.q),
    categoria: str(sp.cat),
    subcategoria: str(sp.sub),
    genero: str(sp.gen),
    talle: str(sp.talle),
    estados: estadosPermitidos,
    estado,
    usuarioId: str(sp.user),
    loteId: str(sp.lote),
    proveedorId: str(sp.prov),
    fechaDesde: str(sp.desde),
    fechaHasta: hasta ? `${hasta}T23:59:59` : undefined,
    precioMin: num(sp.min),
    precioMax: num(sp.max),
  };

  const sortRaw = str(sp.sort) as OrdenPrenda | undefined;
  const orderBy: OrdenPrenda =
    sortRaw && ORDENES_VALIDOS.includes(sortRaw) ? sortRaw : "fechaIngreso";
  const orderDir = str(sp.dir) === "asc" ? "asc" : "desc";
  const page = Math.max(1, num(sp.page) ?? 1);

  const raw: InventoryParams = {
    q: str(sp.q),
    cat: str(sp.cat),
    sub: str(sp.sub),
    gen: str(sp.gen),
    talle: str(sp.talle),
    estado,
    user: str(sp.user),
    lote: str(sp.lote),
    prov: str(sp.prov),
    desde: str(sp.desde),
    hasta,
    min: str(sp.min),
    max: str(sp.max),
    sort: orderBy,
    dir: orderDir,
    view: str(sp.view),
  };

  return { filtros, orden: { orderBy, orderDir } as const, page, raw };
}

export function toListaDTO(p: PrendaLista): PrendaListaDTO {
  return {
    id: p.id,
    codigoInterno: p.codigoInterno,
    nombre: p.nombre,
    categoria: p.categoria,
    subcategoria: p.subcategoria,
    genero: p.genero,
    talle: p.talle,
    precioVenta: p.precioVenta,
    costo: p.costo,
    estado: p.estado,
    fechaIngreso: p.fechaIngreso.toISOString(),
    usuario: `${p.usuarioCarga.nombre} ${p.usuarioCarga.apellido}`,
    imagenPrincipal: p.imagenes[0]?.url ?? null,
    lote: p.lote.numero,
    loteId: p.lote.id,
    proveedor: p.lote.proveedor.nombre,
    proveedorId: p.lote.proveedor.id,
  };
}
