"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut, ChevronDown } from "lucide-react";
import { Avatar, ThemeToggle } from "@/components/ui";
import { ROLE_LABELS } from "@/utils/constants";
import { logoutAction } from "@/app/(auth)/login/actions";
import type { SessionUser } from "@/types";

export function Topbar({
  user,
  onMenuClick,
}: {
  user: SessionUser;
  onMenuClick: () => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    await logoutAction();
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--border)] px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-muted hover:bg-surface-2 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <ThemeToggle />

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-surface-2"
        >
          <Avatar name={user.name} size="sm" />
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium leading-tight">{user.name}</p>
            <p className="text-xs leading-tight text-muted">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted" />
        </button>

        {menuOpen && (
          <div className="card-surface animate-scale-in absolute right-0 mt-2 w-56 overflow-hidden p-1.5">
            <div className="border-b border-[var(--border)] px-3 py-2.5">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
