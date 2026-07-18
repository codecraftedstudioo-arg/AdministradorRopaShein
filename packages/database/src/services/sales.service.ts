// Servicio de acceso a datos: Ventas (1:1 con la prenda; nunca se elimina).
// La ganancia NUNCA se persiste: se calcula como precioFinal - prenda.costo.
import type { CanalVenta, Categoria, Prisma } from "@prisma/client";
import {
  CATEGORIA_LABELS,
  CANAL_VENTA_LABELS,
  CATEGORIAS,
  CANALES_VENTA,
} from "@shein/shared";
import { prisma } from "../client";

// ------------------------------------------------------------
//  Tipos y proyección
// ------------------------------------------------------------

const VENTA_SELECT = {
  id: true,
  canalVenta: true,
  precioFinal: true,
  observaciones: true,
  fechaVenta: true,
  usuarioId: true,
  usuario: { select: { id: true, nombre: true, apellido: true } },
  prenda: {
    select: {
      id: true,
      codigoInterno: true,
      nombre: true,
      categoria: true,
      costo: true,
      imagenes: {
        where: { esPrincipal: true },
        take: 1,
        select: { url: true },
      },
    },
  },
} satisfies Prisma.VentaSelect;

export type VentaRow = Prisma.VentaGetPayload<{ select: typeof VENTA_SELECT }>;

export interface RegistrarVentaData {
  prendaId: string;
  usuarioId: string;
  canalVenta: CanalVenta;
  precioFinal: number;
  observaciones?: string;
  fechaVenta?: Date;
}

export interface FiltrosVenta {
  search?: string;
  canal?: string;
  vendedorId?: string;
  categoria?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  precioMin?: number;
  precioMax?: number;
  gananciaMin?: number;
  gananciaMax?: number;
}

export type OrdenVenta = "fecha" | "ganancia" | "precio" | "categoria" | "canal";

export interface OpcionesVenta {
  orderBy?: OrdenVenta;
  orderDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

// ------------------------------------------------------------
//  Helpers de fecha (sin dependencias externas)
// ------------------------------------------------------------

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const startOfWeek = (d: Date) => {
  const x = startOfDay(d);
  const dow = (x.getDay() + 6) % 7; // lunes = 0
  x.setDate(x.getDate() - dow);
  return x;
};
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1);

const MESES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function textoBusqueda(row: VentaRow): string {
  const cat = row.prenda.categoria;
  return normalizar(
    [
      row.prenda.codigoInterno,
      row.prenda.nombre,
      cat,
      CATEGORIA_LABELS[cat as keyof typeof CATEGORIA_LABELS] ?? "",
      row.canalVenta,
      CANAL_VENTA_LABELS[row.canalVenta as keyof typeof CANAL_VENTA_LABELS] ?? "",
      `${row.usuario.nombre} ${row.usuario.apellido}`,
      row.fechaVenta.toLocaleDateString("es-AR"),
      row.fechaVenta.toISOString().slice(0, 10),
    ].join(" "),
  );
}

function ganancia(row: VentaRow): number {
  return row.precioFinal - row.prenda.costo;
}

function buildWhere(f?: FiltrosVenta): Prisma.VentaWhereInput {
  const and: Prisma.VentaWhereInput[] = [];
  if (f?.canal) and.push({ canalVenta: f.canal as CanalVenta });
  if (f?.vendedorId) and.push({ usuarioId: f.vendedorId });
  if (f?.categoria) and.push({ prenda: { categoria: f.categoria as Categoria } });
  if (f?.fechaDesde) and.push({ fechaVenta: { gte: new Date(f.fechaDesde) } });
  if (f?.fechaHasta) and.push({ fechaVenta: { lte: new Date(f.fechaHasta) } });
  if (f?.precioMin != null) and.push({ precioFinal: { gte: f.precioMin } });
  if (f?.precioMax != null) and.push({ precioFinal: { lte: f.precioMax } });
  return and.length ? { AND: and } : {};
}

// ------------------------------------------------------------
//  Servicio
// ------------------------------------------------------------

export const ventasService = {
  /**
   * Registra la venta y marca la prenda como VENDIDA en una transacción.
   * Solo se puede vender una prenda DISPONIBLE.
   */
  async registrar(data: RegistrarVentaData) {
    return prisma.$transaction(async (tx) => {
      const prenda = await tx.prenda.findFirst({
        where: { id: data.prendaId, deletedAt: null },
        select: { id: true, estado: true },
      });
      if (!prenda) throw new Error("PRENDA_NO_ENCONTRADA");
      // Flujo: Disponible → Reservada (opcional) → Vendida.
      if (prenda.estado !== "DISPONIBLE" && prenda.estado !== "RESERVADA") {
        throw new Error(`ESTADO_${prenda.estado}`);
      }

      const venta = await tx.venta.create({
        data: {
          prendaId: data.prendaId,
          usuarioId: data.usuarioId,
          canalVenta: data.canalVenta,
          precioFinal: data.precioFinal,
          observaciones: data.observaciones || null,
          fechaVenta: data.fechaVenta ?? new Date(),
        },
      });

      await tx.prenda.update({
        where: { id: data.prendaId },
        data: { estado: "VENDIDA" },
      });

      return venta;
    });
  },

  buscarPorPrenda(prendaId: string) {
    return prisma.venta.findUnique({ where: { prendaId } });
  },

  /**
   * Listado con filtros combinables, búsqueda, orden y paginación.
   * La ganancia se calcula en memoria (depende del costo de la prenda),
   * por lo que el filtrado por ganancia, la búsqueda libre y el orden se
   * resuelven en JS sobre el conjunto ya acotado por los filtros de BD.
   */
  async listar(filtros?: FiltrosVenta, opciones?: OpcionesVenta) {
    const rows = await prisma.venta.findMany({
      where: buildWhere(filtros),
      select: VENTA_SELECT,
      orderBy: { fechaVenta: "desc" },
    });

    let items = rows;

    if (filtros?.search) {
      const q = normalizar(filtros.search.trim());
      if (q) items = items.filter((r) => textoBusqueda(r).includes(q));
    }
    if (filtros?.gananciaMin != null) {
      items = items.filter((r) => ganancia(r) >= filtros.gananciaMin!);
    }
    if (filtros?.gananciaMax != null) {
      items = items.filter((r) => ganancia(r) <= filtros.gananciaMax!);
    }

    const dir = opciones?.orderDir === "asc" ? 1 : -1;
    const by = opciones?.orderBy ?? "fecha";
    items = [...items].sort((a, b) => {
      let d = 0;
      switch (by) {
        case "ganancia":
          d = ganancia(a) - ganancia(b);
          break;
        case "precio":
          d = a.precioFinal - b.precioFinal;
          break;
        case "categoria":
          d = a.prenda.categoria.localeCompare(b.prenda.categoria);
          break;
        case "canal":
          d = a.canalVenta.localeCompare(b.canalVenta);
          break;
        default:
          d = a.fechaVenta.getTime() - b.fechaVenta.getTime();
      }
      return dir * d;
    });

    const total = items.length;
    const page = Math.max(1, opciones?.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, opciones?.pageSize ?? 20));
    const paged = items.slice((page - 1) * pageSize, page * pageSize);

    return { items: paged, total, page, pageSize };
  },

  /** Igual que `listar` pero sin paginar (para exportaciones del set filtrado). */
  async listarTodo(filtros?: FiltrosVenta, opciones?: OpcionesVenta) {
    const { items } = await this.listar(filtros, {
      ...opciones,
      page: 1,
      pageSize: 100000,
    });
    return items;
  },

  /** Métricas, series de gráficos y reportes para el dashboard de ventas. */
  async analiticas() {
    const rows = await prisma.venta.findMany({
      select: VENTA_SELECT,
      orderBy: { fechaVenta: "desc" },
    });

    const ahora = new Date();
    const iniDia = startOfDay(ahora);
    const iniSemana = startOfWeek(ahora);
    const iniMes = startOfMonth(ahora);
    const iniAnio = startOfYear(ahora);

    const periodos = {
      dia: { cantidad: 0, facturacion: 0, ganancia: 0 },
      semana: { cantidad: 0, facturacion: 0, ganancia: 0 },
      mes: { cantidad: 0, facturacion: 0, ganancia: 0 },
      anio: { cantidad: 0, facturacion: 0, ganancia: 0 },
    };

    let facturacionTotal = 0;
    let gananciaTotal = 0;

    const porCategoria = new Map<string, { cantidad: number; total: number }>();
    const porCanal = new Map<string, { cantidad: number; total: number; ganancia: number }>();
    const porVendedor = new Map<
      string,
      { id: string; vendedor: string; cantidad: number; monto: number; ganancia: number; ventasMes: number }
    >();

    // Series temporales
    const dias = 30;
    const serieDia = new Map<string, { total: number; ganancia: number }>();
    for (let i = dias - 1; i >= 0; i--) {
      const d = new Date(iniDia);
      d.setDate(d.getDate() - i);
      serieDia.set(d.toISOString().slice(0, 10), { total: 0, ganancia: 0 });
    }

    const meses = 12;
    const serieMes = new Map<string, { facturacion: number; ganancia: number; label: string }>();
    for (let i = meses - 1; i >= 0; i--) {
      const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      serieMes.set(key, { facturacion: 0, ganancia: 0, label: MESES[d.getMonth()] });
    }

    for (const r of rows) {
      const g = ganancia(r);
      facturacionTotal += r.precioFinal;
      gananciaTotal += g;

      if (r.fechaVenta >= iniDia) {
        periodos.dia.cantidad++;
        periodos.dia.facturacion += r.precioFinal;
        periodos.dia.ganancia += g;
      }
      if (r.fechaVenta >= iniSemana) {
        periodos.semana.cantidad++;
        periodos.semana.facturacion += r.precioFinal;
        periodos.semana.ganancia += g;
      }
      if (r.fechaVenta >= iniMes) {
        periodos.mes.cantidad++;
        periodos.mes.facturacion += r.precioFinal;
        periodos.mes.ganancia += g;
      }
      if (r.fechaVenta >= iniAnio) {
        periodos.anio.cantidad++;
        periodos.anio.facturacion += r.precioFinal;
        periodos.anio.ganancia += g;
      }

      // Categoría
      const cat = porCategoria.get(r.prenda.categoria) ?? { cantidad: 0, total: 0 };
      cat.cantidad++;
      cat.total += r.precioFinal;
      porCategoria.set(r.prenda.categoria, cat);

      // Canal
      const can = porCanal.get(r.canalVenta) ?? { cantidad: 0, total: 0, ganancia: 0 };
      can.cantidad++;
      can.total += r.precioFinal;
      can.ganancia += g;
      porCanal.set(r.canalVenta, can);

      // Vendedor
      const vend =
        porVendedor.get(r.usuarioId) ?? {
          id: r.usuarioId,
          vendedor: `${r.usuario.nombre} ${r.usuario.apellido}`,
          cantidad: 0,
          monto: 0,
          ganancia: 0,
          ventasMes: 0,
        };
      vend.cantidad++;
      vend.monto += r.precioFinal;
      vend.ganancia += g;
      if (r.fechaVenta >= iniMes) vend.ventasMes++;
      porVendedor.set(r.usuarioId, vend);

      // Series
      const kd = r.fechaVenta.toISOString().slice(0, 10);
      const sd = serieDia.get(kd);
      if (sd) {
        sd.total += r.precioFinal;
        sd.ganancia += g;
      }
      const km = `${r.fechaVenta.getFullYear()}-${r.fechaVenta.getMonth()}`;
      const sm = serieMes.get(km);
      if (sm) {
        sm.facturacion += r.precioFinal;
        sm.ganancia += g;
      }
    }

    const cantidad = rows.length;

    const ventasPorCategoria = CATEGORIAS.map((c) => ({
      categoria: c,
      cantidad: porCategoria.get(c)?.cantidad ?? 0,
      total: porCategoria.get(c)?.total ?? 0,
    })).filter((c) => c.cantidad > 0);

    const ventasPorCanal = CANALES_VENTA.map((c) => ({
      canal: c,
      cantidad: porCanal.get(c)?.cantidad ?? 0,
      total: porCanal.get(c)?.total ?? 0,
      ganancia: porCanal.get(c)?.ganancia ?? 0,
    }));

    const reporteVendedores = [...porVendedor.values()].sort(
      (a, b) => b.monto - a.monto,
    );

    return {
      periodos,
      totales: {
        cantidad,
        facturacion: facturacionTotal,
        ganancia: gananciaTotal,
        precioPromedio: cantidad ? Math.round(facturacionTotal / cantidad) : 0,
        ticketPromedio: cantidad ? Math.round(facturacionTotal / cantidad) : 0,
      },
      graficos: {
        ventasPorDia: [...serieDia.entries()].map(([fecha, v]) => ({
          fecha: fecha.slice(5), // MM-DD
          total: v.total,
          ganancia: v.ganancia,
        })),
        gananciasMensuales: [...serieMes.values()].map((v) => ({
          mes: v.label,
          facturacion: v.facturacion,
          ganancia: v.ganancia,
        })),
        ventasPorCategoria,
        ventasPorCanal,
        topCategorias: [...ventasPorCategoria]
          .sort((a, b) => b.total - a.total)
          .slice(0, 5),
        topVendedores: reporteVendedores.slice(0, 5).map((v) => ({
          vendedor: v.vendedor,
          total: v.monto,
          ganancia: v.ganancia,
        })),
      },
      reporteVendedores,
      reporteCanales: ventasPorCanal,
      ultimas: rows.slice(0, 8),
    };
  },
};
