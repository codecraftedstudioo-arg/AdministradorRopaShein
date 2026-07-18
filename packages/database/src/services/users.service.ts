// Servicio de acceso a datos: Usuarios.
// Nunca elimina usuarios (borrado lógico vía deletedAt / campo activo).
import type { Prisma } from "@prisma/client";
import { hashPassword } from "@shein/auth/password";
import { prisma } from "../client";

const CON_ROL = { rol: true } satisfies Prisma.UsuarioInclude;

export type UsuarioConRol = Prisma.UsuarioGetPayload<{
  include: typeof CON_ROL;
}>;

export interface CrearUsuarioData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rolId: string;
}

export interface ActualizarUsuarioData {
  nombre: string;
  apellido: string;
  email: string;
}

export const usuariosService = {
  listar(): Promise<UsuarioConRol[]> {
    return prisma.usuario.findMany({
      where: { deletedAt: null },
      include: CON_ROL,
      orderBy: { createdAt: "desc" },
    });
  },

  buscarPorId(id: string): Promise<UsuarioConRol | null> {
    return prisma.usuario.findFirst({
      where: { id, deletedAt: null },
      include: CON_ROL,
    });
  },

  buscarPorEmail(email: string): Promise<UsuarioConRol | null> {
    return prisma.usuario.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
      include: CON_ROL,
    });
  },

  async emailEnUso(email: string, exceptoId?: string): Promise<boolean> {
    const existente = await prisma.usuario.findFirst({
      where: {
        email: email.toLowerCase(),
        ...(exceptoId ? { NOT: { id: exceptoId } } : {}),
      },
      select: { id: true },
    });
    return existente !== null;
  },

  async crear(data: CrearUsuarioData): Promise<UsuarioConRol> {
    const passwordHash = await hashPassword(data.password);
    return prisma.usuario.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email.toLowerCase(),
        passwordHash,
        rolId: data.rolId,
      },
      include: CON_ROL,
    });
  },

  actualizar(
    id: string,
    data: ActualizarUsuarioData,
  ): Promise<UsuarioConRol> {
    return prisma.usuario.update({
      where: { id },
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email.toLowerCase(),
      },
      include: CON_ROL,
    });
  },

  cambiarEstado(id: string, activo: boolean): Promise<UsuarioConRol> {
    return prisma.usuario.update({
      where: { id },
      data: { activo },
      include: CON_ROL,
    });
  },

  async cambiarPassword(id: string, nuevaPassword: string): Promise<void> {
    const passwordHash = await hashPassword(nuevaPassword);
    await prisma.usuario.update({ where: { id }, data: { passwordHash } });
  },

  cambiarRol(id: string, rolId: string): Promise<UsuarioConRol> {
    return prisma.usuario.update({
      where: { id },
      data: { rolId },
      include: CON_ROL,
    });
  },

  async registrarUltimoLogin(id: string): Promise<void> {
    await prisma.usuario.update({
      where: { id },
      data: { ultimoLogin: new Date() },
    });
  },
};
