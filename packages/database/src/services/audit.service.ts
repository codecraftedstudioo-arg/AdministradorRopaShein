// Servicio de acceso a datos: Auditoría.
// Solo inserción y lectura: los registros nunca se editan ni se eliminan.
import type { Prisma } from "@prisma/client";
import { prisma } from "../client";

const CON_USUARIO = {
  usuario: {
    select: { id: true, nombre: true, apellido: true, email: true },
  },
} satisfies Prisma.AuditoriaInclude;

export type AuditoriaConUsuario = Prisma.AuditoriaGetPayload<{
  include: typeof CON_USUARIO;
}>;

export interface RegistrarAuditoriaInput {
  usuarioId: string;
  entidad: string;
  entidadId: string;
  accion: string;
  valorAnterior?: unknown;
  valorNuevo?: unknown;
}

export interface ListarAuditoriaOpts {
  entidad?: string;
  entidadId?: string;
  usuarioId?: string;
  accion?: string;
  page?: number;
  pageSize?: number;
}

function toJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined || value === null) return undefined;
  return value as Prisma.InputJsonValue;
}

export const auditoriaService = {
  registrar(input: RegistrarAuditoriaInput) {
    return prisma.auditoria.create({
      data: {
        usuarioId: input.usuarioId,
        entidad: input.entidad,
        entidadId: input.entidadId,
        accion: input.accion,
        valorAnterior: toJson(input.valorAnterior),
        valorNuevo: toJson(input.valorNuevo),
      },
    });
  },

  buildWhere(opts?: ListarAuditoriaOpts): Prisma.AuditoriaWhereInput {
    return {
      ...(opts?.entidad ? { entidad: opts.entidad } : {}),
      ...(opts?.entidadId ? { entidadId: opts.entidadId } : {}),
      ...(opts?.usuarioId ? { usuarioId: opts.usuarioId } : {}),
      ...(opts?.accion ? { accion: opts.accion } : {}),
    };
  },

  listar(opts?: ListarAuditoriaOpts): Promise<AuditoriaConUsuario[]> {
    const page = opts?.page ?? 1;
    const pageSize = opts?.pageSize ?? 50;
    return prisma.auditoria.findMany({
      where: this.buildWhere(opts),
      include: CON_USUARIO,
      orderBy: { fecha: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  },

  contar(opts?: ListarAuditoriaOpts): Promise<number> {
    return prisma.auditoria.count({ where: this.buildWhere(opts) });
  },
};
