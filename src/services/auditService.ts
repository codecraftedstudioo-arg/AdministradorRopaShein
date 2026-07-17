import "server-only";
import type { Prisma, AuditAction, AuditEntity } from "@prisma/client";
import { prisma } from "@/lib/prisma";

interface LogInput {
  actorId: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  summary: string;
  changes?: Prisma.InputJsonValue;
}

/**
 * Registra una acción en la auditoría. Puede recibir un cliente
 * de transacción para escribir dentro de la misma operación atómica.
 */
export async function logAction(
  input: LogInput,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) {
  return tx.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      summary: input.summary,
      changes: input.changes,
    },
  });
}

/** Historial de una entidad específica (ej: una prenda). */
export async function getEntityHistory(entity: AuditEntity, entityId: string) {
  return prisma.auditLog.findMany({
    where: { entity, entityId },
    include: {
      actor: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Actividad reciente global (para dashboard). */
export async function getRecentActivity(limit = 8) {
  return prisma.auditLog.findMany({
    take: limit,
    include: {
      actor: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

interface AuditQuery {
  action?: AuditAction;
  entity?: AuditEntity;
  actorId?: string;
  page?: number;
  pageSize?: number;
}

/** Listado paginado del registro de auditoría (para la sección Auditoría). */
export async function getAuditLog(query: AuditQuery = {}) {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 30;
  const where: Prisma.AuditLogWhereInput = {
    ...(query.action ? { action: query.action } : {}),
    ...(query.entity ? { entity: query.entity } : {}),
    ...(query.actorId ? { actorId: query.actorId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        actor: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
