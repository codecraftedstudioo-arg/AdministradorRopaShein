"use client";

import type { ReactNode } from "react";
import type { Permiso } from "@shein/shared";
import { usePermissions } from "@/hooks/usePermissions";

/** Renderiza `children` solo si la sesión tiene el permiso indicado. */
export function Can({
  permiso,
  children,
  fallback = null,
}: {
  permiso: Permiso;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { can } = usePermissions();
  return <>{can(permiso) ? children : fallback}</>;
}
