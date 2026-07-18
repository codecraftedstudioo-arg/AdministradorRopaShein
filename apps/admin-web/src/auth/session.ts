import "server-only";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  firmarSesion,
  verificarSesion,
  type SesionUsuario,
} from "@shein/auth";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: SESSION_TTL_SECONDS,
  path: "/",
};

/** Crea la cookie de sesión (usar en Server Actions / Route Handlers). */
export async function crearSesion(usuario: SesionUsuario): Promise<void> {
  const token = await firmarSesion(usuario);
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, cookieOptions);
}

/** Elimina la cookie de sesión. */
export async function destruirSesion(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

/** Lee la sesión actual desde la cookie (o null). */
export async function obtenerSesion(): Promise<SesionUsuario | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  const verificada = await verificarSesion(token);
  return verificada?.usuario ?? null;
}
