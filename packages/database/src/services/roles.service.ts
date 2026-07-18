// Servicio de acceso a datos: Roles.
import { prisma } from "../client";

export const rolesService = {
  listar() {
    return prisma.rol.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    });
  },

  buscarPorId(id: string) {
    return prisma.rol.findUnique({ where: { id } });
  },

  buscarPorClave(clave: string) {
    return prisma.rol.findUnique({ where: { clave } });
  },
};
