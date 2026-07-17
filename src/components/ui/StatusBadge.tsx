import type { ProductStatus } from "@prisma/client";
import { Badge } from "./Badge";
import { STATUS_LABELS, STATUS_STYLES } from "@/utils/constants";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  className,
}: {
  status: ProductStatus;
  className?: string;
}) {
  return (
    <Badge className={cn(STATUS_STYLES[status], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABELS[status]}
    </Badge>
  );
}
