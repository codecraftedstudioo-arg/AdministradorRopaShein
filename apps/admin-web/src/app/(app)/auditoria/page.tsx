import type { Metadata } from "next";
import { auditoriaService } from "@shein/database";
import { PERMISOS, ACCION_AUDITORIA_LABELS } from "@shein/shared";
import { requirePermiso } from "@/auth/guards";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge, Avatar, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Auditoría" };

function valorResumen(valor: unknown): string | null {
  if (valor === null || valor === undefined) return null;
  try {
    return JSON.stringify(valor);
  } catch {
    return null;
  }
}

export default async function AuditoriaPage() {
  await requirePermiso(PERMISOS.AUDITORIA_VER);

  const registros = await auditoriaService.listar({ pageSize: 100 });

  return (
    <div>
      <PageHeader
        title="Auditoría"
        description="Registro de acciones del sistema: quién, qué y cuándo."
      />

      <div className="card-surface overflow-hidden">
        {registros.length === 0 ? (
          <div className="p-10">
            <EmptyState
              title="Sin registros"
              description="Todavía no hay acciones auditadas."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs text-muted">
                  <th className="px-5 py-3 font-medium">Fecha y hora</th>
                  <th className="px-5 py-3 font-medium">Usuario</th>
                  <th className="px-5 py-3 font-medium">Acción</th>
                  <th className="px-5 py-3 font-medium">Entidad</th>
                  <th className="px-5 py-3 font-medium">Cambios</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r) => {
                  const nombre = `${r.usuario.nombre} ${r.usuario.apellido}`;
                  const anterior = valorResumen(r.valorAnterior);
                  const nuevo = valorResumen(r.valorNuevo);
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-[var(--border)] align-top last:border-0 hover:bg-surface-2/50"
                    >
                      <td className="whitespace-nowrap px-5 py-3 text-muted">
                        {formatDate(r.fecha, true)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={nombre} size="sm" />
                          <span className="font-medium">{nombre}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge className="bg-surface-2 text-foreground ring-[var(--border)]">
                          {ACCION_AUDITORIA_LABELS[r.accion] ?? r.accion}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-foreground">{r.entidad}</span>
                        <span className="ml-1 font-mono text-xs text-muted">
                          {r.entidadId.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {anterior || nuevo ? (
                          <div className="flex flex-col gap-0.5 font-mono text-xs text-muted">
                            {anterior && <span>− {anterior}</span>}
                            {nuevo && <span>+ {nuevo}</span>}
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
