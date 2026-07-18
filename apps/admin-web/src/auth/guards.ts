import "server-only";
import { redirect } from "next/navigation";
import { tienePermiso, type Permiso } from "@shein/shared";
import type { SesionUsuario } from "@shein/auth/session";
import { obtenerSesion } from "./session";

/** Exige sesión activa. Redirige al login si no hay. */
export async function requireSesion(): Promise<SesionUsuario> {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");
  return sesion;
}

/** Exige un permiso. Redirige a /cuenta si no lo tiene. */
export async function requirePermiso(permiso: Permiso): Promise<SesionUsuario> {
  const sesion = await requireSesion();
  if (!tienePermiso(sesion.permisos, permiso)) {
    redirect("/cuenta?forbidden=1");
  }
  return sesion;
}
