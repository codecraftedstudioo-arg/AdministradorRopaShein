"use client";

import { useSessionContext } from "@/providers/SessionProvider";

/** Devuelve la sesión del usuario autenticado (dentro del área protegida). */
export function useSession() {
  return useSessionContext();
}
