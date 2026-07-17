import "server-only";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { getSession } from "./session";
import type { SessionUser } from "@/types";

export { createSession, destroySession, getSession } from "./session";
export { hashPassword, verifyPassword } from "./password";

/**
 * Devuelve el usuario de la sesión o redirige al login.
 * Usar en layouts/páginas protegidas.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Requiere que el usuario tenga uno de los roles indicados.
 * Redirige al dashboard si no está autorizado.
 */
export async function requireRole(roles: Role[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    redirect("/dashboard");
  }
  return user;
}

/** Devuelve el usuario actual sin redirigir (o null). */
export async function getCurrentUser(): Promise<SessionUser | null> {
  return getSession();
}
