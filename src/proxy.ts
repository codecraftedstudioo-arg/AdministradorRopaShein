import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "shein_session";

// Rutas públicas que no requieren sesión.
const PUBLIC_PATHS = ["/login"];

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? "");
}

async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const authenticated = await isValidSession(token);

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Redirigir la raíz según el estado de sesión.
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(authenticated ? "/dashboard" : "/login", request.url),
    );
  }

  // Usuario autenticado intentando ir al login -> al dashboard.
  if (authenticated && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Ruta protegida sin sesión -> al login.
  if (!authenticated && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Protege todo excepto assets estáticos y las APIs de auth.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|uploads|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)).*)",
  ],
};
