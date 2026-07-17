import {
  Plus,
  Pencil,
  DollarSign,
  Archive,
  RotateCcw,
  LogIn,
  LogOut,
  Upload,
  Tag,
  type LucideIcon,
} from "lucide-react";
import type { AuditAction } from "@prisma/client";
import { Avatar } from "@/components/ui";
import { timeAgo } from "@/lib/utils";
import type { AuditLogWithActor } from "@/types";

const ACTION_ICON: Record<AuditAction, LucideIcon> = {
  CREATE: Plus,
  UPDATE: Pencil,
  STATUS_CHANGE: Tag,
  PRICE_CHANGE: DollarSign,
  SELL: DollarSign,
  ARCHIVE: Archive,
  RESTORE: RotateCcw,
  LOGIN: LogIn,
  LOGOUT: LogOut,
  IMPORT: Upload,
};

export function ActivityFeed({ items }: { items: AuditLogWithActor[] }) {
  if (items.length === 0) {
    return (
      <p className="px-6 py-8 text-center text-sm text-muted">
        Todavía no hay actividad registrada.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-[var(--border)]">
      {items.map((item) => {
        const Icon = ACTION_ICON[item.action] ?? Pencil;
        return (
          <li key={item.id} className="flex items-start gap-3 px-6 py-3.5">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">{item.summary}</p>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                <Avatar name={item.actor.name} size="sm" className="h-4 w-4 text-[8px]" />
                <span>{item.actor.name}</span>
                <span>·</span>
                <span>{timeAgo(item.createdAt)}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
