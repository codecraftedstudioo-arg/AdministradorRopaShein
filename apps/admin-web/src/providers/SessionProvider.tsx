"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SesionUsuario } from "@shein/auth/session";

const SessionContext = createContext<SesionUsuario | null>(null);

export function SessionProvider({
  value,
  children,
}: {
  value: SesionUsuario;
  children: ReactNode;
}) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSessionContext(): SesionUsuario | null {
  return useContext(SessionContext);
}
