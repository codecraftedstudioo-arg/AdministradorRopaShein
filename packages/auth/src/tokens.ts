// Firma y verificación de tokens de sesión (JWT HS256 con jose).
// Compatible con edge runtime (no usa APIs de Node ni bcrypt).
import { SignJWT, jwtVerify } from "jose";
import { SESSION_TTL_DAYS, SESSION_VERSION } from "./config";
import type { SesionUsuario } from "./session";

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET no está definido en las variables de entorno");
  }
  return new TextEncoder().encode(secret);
}

/** Firma un JWT con la sesión del usuario. */
export async function firmarSesion(usuario: SesionUsuario): Promise<string> {
  return new SignJWT({ ...usuario, v: SESSION_VERSION })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_DAYS}d`)
    .sign(getSecretKey());
}

export interface SesionVerificada {
  usuario: SesionUsuario;
  /** Expiración (epoch en segundos). */
  exp: number;
  /** Emisión (epoch en segundos). */
  iat: number;
}

/** Verifica y decodifica un JWT de sesión. Devuelve null si es inválido. */
export async function verificarSesion(
  token: string | undefined,
): Promise<SesionVerificada | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    // Rechaza tokens de un formato/versión anterior (fuerza re-login limpio).
    if (payload.v !== SESSION_VERSION || typeof payload.rolClave !== "string") {
      return null;
    }
    return {
      usuario: {
        id: payload.id as string,
        nombre: payload.nombre as string,
        apellido: payload.apellido as string,
        email: payload.email as string,
        rolClave: payload.rolClave as string,
        rolNombre: payload.rolNombre as string,
        permisos: (payload.permisos as string[]) ?? [],
      },
      exp: payload.exp as number,
      iat: payload.iat as number,
    };
  } catch {
    return null;
  }
}
