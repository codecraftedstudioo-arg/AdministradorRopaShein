import type { FiltrosVenta, OrdenVenta, VentaRow } from "@shein/database";
import type { VentaDTO } from "@/types/sales";
import type { SalesParams } from "@/components/sales/SalesView";

const ORDENES_VALIDOS: OrdenVenta[] = [
  "fecha",
  "ganancia",
  "precio",
  "categoria",
  "canal",
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

export function parseSalesParams(sp: SearchParamsRaw) {
  const hasta = str(sp.hasta);

  const filtros: FiltrosVenta = {
    search: str(sp.q),
    canal: str(sp.canal),
    vendedorId: str(sp.vend),
    categoria: str(sp.cat),
    fechaDesde: str(sp.desde),
    fechaHasta: hasta ? `${hasta}T23:59:59` : undefined,
    precioMin: num(sp.min),
    precioMax: num(sp.max),
    gananciaMin: num(sp.gmin),
    gananciaMax: num(sp.gmax),
  };

  const sortRaw = str(sp.sort) as OrdenVenta | undefined;
  const orderBy: OrdenVenta =
    sortRaw && ORDENES_VALIDOS.includes(sortRaw) ? sortRaw : "fecha";
  const orderDir = str(sp.dir) === "asc" ? "asc" : "desc";
  const page = Math.max(1, num(sp.page) ?? 1);

  const raw: SalesParams = {
    q: str(sp.q),
    canal: str(sp.canal),
    vend: str(sp.vend),
    cat: str(sp.cat),
    desde: str(sp.desde),
    hasta,
    min: str(sp.min),
    max: str(sp.max),
    gmin: str(sp.gmin),
    gmax: str(sp.gmax),
    sort: orderBy,
    dir: orderDir,
  };

  return { filtros, orden: { orderBy, orderDir } as const, page, raw };
}

export function toVentaDTO(r: VentaRow): VentaDTO {
  return {
    id: r.id,
    fecha: r.fechaVenta.toISOString(),
    canal: r.canalVenta,
    precioFinal: r.precioFinal,
    costo: r.prenda.costo,
    ganancia: r.precioFinal - r.prenda.costo,
    observaciones: r.observaciones,
    prendaId: r.prenda.id,
    codigoInterno: r.prenda.codigoInterno,
    nombre: r.prenda.nombre,
    categoria: r.prenda.categoria,
    imagen: r.prenda.imagenes[0]?.url ?? null,
    vendedor: `${r.usuario.nombre} ${r.usuario.apellido}`,
    vendedorId: r.usuario.id,
  };
}
