"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { SessionProvider } from "@/providers/SessionProvider";
import type { SesionUsuario } from "@shein/auth/session";

export function AppShell({
  usuario,
  children,
}: {
  usuario: SesionUsuario;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <SessionProvider value={usuario}>
      <div className="min-h-screen">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="lg:pl-64">
          <Topbar usuario={usuario} onMenuClick={() => setMobileOpen(true)} />
          <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
