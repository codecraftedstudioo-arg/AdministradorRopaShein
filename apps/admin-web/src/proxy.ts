import { NextResponse, type NextRequest } from "next/server";
import { verificarSesion, firmarSesion } from "@shein/auth/tokens";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  SESSION_RENEW_THRESHOLD_SECONDS,
} from "@shein/auth/config";

// Rutas públicas (no requieren sesión).
const PUBLIC_PATHS = ["/login", "/recuperar"];

function esPublica(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const sesion = await verificarSesion(token);
  const autenticado = sesion !== null;
  const publica = esPublica(pathname);

  // Raíz: redirige según estado de sesión.
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(autenticado ? "/inventario" : "/login", request.url),
    );
  }

  // Autenticado entrando a una ruta pública -> al área privada.
  if (autenticado && publica) {
    return NextResponse.redirect(new URL("/inventario", request.url));
  }

  // No autenticado en ruta protegida -> al login (con callback).
  if (!autenticado && !publica) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Renovación deslizante: re-emite el token si le queda poca vida.
  if (autenticado && sesion) {
    const restante = sesion.exp - Math.floor(Date.now() / 1000);
    if (restante < SESSION_RENEW_THRESHOLD_SECONDS) {
      const nuevoToken = await firmarSesion(sesion.usuario);
      const res = NextResponse.next();
      res.cookies.set(SESSION_COOKIE_NAME, nuevoToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_TTL_SECONDS,
        path: "/",
      });
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)).*)",
  ],
};
