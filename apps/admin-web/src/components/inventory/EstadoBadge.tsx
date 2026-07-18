import { Badge } from "@/components/ui";
import { ESTADO_BADGE, ESTADO_LABELS, type EstadoValor } from "@shein/shared";
import { cn } from "@/lib/utils";

export function EstadoBadge({ estado }: { estado: string }) {
  const key = estado as EstadoValor;
  return (
    <Badge className={cn(ESTADO_BADGE[key] ?? "")}>
      {ESTADO_LABELS[key] ?? estado}
    </Badge>
  );
}
