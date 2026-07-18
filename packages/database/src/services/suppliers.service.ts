// Servicio de acceso a datos: Proveedores.
import type { Prisma } from "@prisma/client";
import { prisma } from "../client";

const LISTA_SELECT = {
  id: true,
  nombre: true,
  activo: true,
  createdAt: true,
  _count: { select: { lotes: true } },
} satisfies Prisma.ProveedorSelect;

export type ProveedorLista = Prisma.ProveedorGetPayload<{
  select: typeof LISTA_SELECT;
}>;

export const proveedoresService = {
  listar(soloActivos = true): Promise<ProveedorLista[]> {
    return prisma.proveedor.findMany({
      where: {
        deletedAt: null,
        ...(soloActivos ? { activo: true } : {}),
      },
      select: LISTA_SELECT,
      orderBy: { nombre: "asc" },
    });
  },

  buscarPorId(id: string) {
    return prisma.proveedor.findFirst({
      where: { id, deletedAt: null },
    });
  },

  async nombreEnUso(nombre: string, exceptoId?: string): Promise<boolean> {
    const existente = await prisma.proveedor.findFirst({
      where: {
        nombre: { equals: nombre, mode: "insensitive" },
        deletedAt: null,
        ...(exceptoId ? { NOT: { id: exceptoId } } : {}),
      },
      select: { id: true },
    });
    return existente !== null;
  },

  crear(nombre: string) {
    return prisma.proveedor.create({
      data: { nombre: nombre.trim() },
    });
  },

  desactivar(id: string) {
    return prisma.proveedor.update({
      where: { id },
      data: { activo: false },
    });
  },
};
