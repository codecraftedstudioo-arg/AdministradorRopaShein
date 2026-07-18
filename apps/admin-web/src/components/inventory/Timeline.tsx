import { ACCION_AUDITORIA_LABELS } from "@shein/shared";
import { formatDate } from "@/lib/utils";

export interface EventoTimeline {
  id: string;
  accion: string;
  usuario: string;
  fecha: string;
  detalle?: string | null;
}

export function Timeline({ eventos }: { eventos: EventoTimeline[] }) {
  if (eventos.length === 0) {
    return <p className="text-sm text-muted">Todavía no hay historial.</p>;
  }

  return (
    <ol className="relative ml-1 border-l border-[var(--border)]">
      {eventos.map((e) => (
        <li key={e.id} className="mb-5 ml-4 last:mb-0">
          <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
          <p className="text-sm font-medium">
            {ACCION_AUDITORIA_LABELS[e.accion] ?? e.accion}
          </p>
          <p className="text-xs text-muted">
            {e.usuario} · {formatDate(e.fecha, true)}
          </p>
          {e.detalle && (
            <p className="mt-0.5 font-mono text-xs text-muted">{e.detalle}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
