"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, X } from "lucide-react";
import { NAV_ITEMS } from "./nav";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { can } = usePermissions();
  const items = NAV_ITEMS.filter((item) => !item.permiso || can(item.permiso));

  return (
    <>
      {mobileOpen && (
        <div
          className="animate-fade-in fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--border)] bg-surface transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-5">
          <Link href="/cuenta" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <ShieldCheck className="h-[18px] w-[18px]" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">
              SHEIN Platform
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-surface-2 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-accent text-accent-foreground shadow-[var(--shadow-soft)]"
                    : "text-muted hover:bg-surface-2 hover:text-foreground",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--border)] p-3">
          <div className="rounded-xl bg-surface-2 p-3">
            <p className="text-xs font-medium text-foreground">
              Acceso seguro
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Sesiones cifradas y auditoría de cada acción.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
