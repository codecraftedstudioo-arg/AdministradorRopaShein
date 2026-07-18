import { Badge } from "@/components/ui";
import {
  CANAL_VENTA_BADGE,
  CANAL_VENTA_LABELS,
  type CanalVentaValor,
} from "@shein/shared";
import { cn } from "@/lib/utils";

export function CanalBadge({ canal }: { canal: string }) {
  const key = canal as CanalVentaValor;
  return (
    <Badge className={cn(CANAL_VENTA_BADGE[key] ?? "")}>
      {CANAL_VENTA_LABELS[key] ?? canal}
    </Badge>
  );
}
