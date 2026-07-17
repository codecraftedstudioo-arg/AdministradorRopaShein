import type { Metadata } from "next";
import { History } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AuditFilters } from "@/components/audit/AuditFilters";
import {
  Card,
  Badge,
  Avatar,
  EmptyState,
  Pagination,
} from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getAuditLog } from "@/services/auditService";
import { listUsers } from "@/services/userService";
import { formatDate } from "@/lib/utils";
import {
  AUDIT_ACTION_LABELS,
  AUDIT_ENTITY_LABELS,
  ROLE_LABELS,
} from "@/utils/constants";
import type { AuditAction, AuditEntity } from "@prisma/client";

export const metadata: Metadata = { title: "Auditoría" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function AuditPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireRole(["ADMIN"]);
  const sp = await searchParams;

  const [result, users] = await Promise.all([
    getAuditLog({
      action: sp.action as AuditAction | undefined,
      entity: sp.entity as AuditEntity | undefined,
      actorId: sp.actorId,
      page: sp.page ? Number(sp.page) : 1,
      pageSize: 30,
    }),
    listUsers(),
  ]);

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Auditoría"
        description="Registro inmutable de todas las acciones. Nada se elimina jamás."
      />

      <AuditFilters users={users.map((u) => ({ id: u.id, name: u.name }))} />

      {result.items.length === 0 ? (
        <EmptyState icon={History} title="Sin registros" />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs font-medium text-muted">
                    <th className="px-4 py-3">Acción</th>
                    <th className="px-4 py-3">Detalle</th>
                    <th className="px-4 py-3">Entidad</th>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Fecha y hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {result.items.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-2">
                      <td className="px-4 py-3">
                        <Badge className="bg-surface-2 text-foreground ring-[var(--border)]">
                          {AUDIT_ACTION_LABELS[log.action]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-foreground">{log.summary}</td>
                      <td className="px-4 py-3 text-muted">
                        {AUDIT_ENTITY_LABELS[log.entity]}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={log.actor.name} size="sm" className="h-6 w-6 text-[10px]" />
                          <div>
                            <p className="text-foreground">{log.actor.name}</p>
                            <p className="text-xs text-muted">
                              {ROLE_LABELS[log.actor.role]}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {formatDate(log.createdAt, true)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
          />
        </>
      )}
    </div>
  );
}
