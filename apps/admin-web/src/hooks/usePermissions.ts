"use client";

import { tienePermiso, esAdmin, type Permiso } from "@shein/shared";
import { useSession } from "./useSession";

/** Helpers de permisos para componentes cliente. */
export function usePermissions() {
  const sesion = useSession();
  const permisos = sesion?.permisos ?? [];
  return {
    permisos,
    can: (permiso: Permiso) => tienePermiso(permisos, permiso),
    esAdmin: esAdmin(sesion?.rolClave),
  };
}
