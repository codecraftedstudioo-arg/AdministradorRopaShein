// Helpers de verificación de permisos (framework-agnósticos).

import { CLAVE_ROL } from "../constants/roles";
import type { Permiso } from "./permisos";

/** ¿La lista de permisos incluye el permiso indicado? */
export function tienePermiso(
  permisos: readonly string[] | null | undefined,
  permiso: Permiso,
): boolean {
  if (!permisos) return false;
  return permisos.includes(permiso);
}

/** ¿Incluye al menos uno de los permisos? */
export function tieneAlgunPermiso(
  permisos: readonly string[] | null | undefined,
  requeridos: readonly Permiso[],
): boolean {
  if (!permisos) return false;
  return requeridos.some((p) => permisos.includes(p));
}

/** ¿Incluye todos los permisos? */
export function tieneTodosLosPermisos(
  permisos: readonly string[] | null | undefined,
  requeridos: readonly Permiso[],
): boolean {
  if (!permisos) return false;
  return requeridos.every((p) => permisos.includes(p));
}

/** Conveniencia: ¿la clave de rol corresponde al administrador? */
export function esAdmin(claveRol: string | null | undefined): boolean {
  return claveRol === CLAVE_ROL.ADMIN;
}
