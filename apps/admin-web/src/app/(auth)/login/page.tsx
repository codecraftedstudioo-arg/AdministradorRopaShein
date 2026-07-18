import { Suspense } from "react";
import type { Metadata } from "next";
import { ShieldCheck, Sparkles, History, Users } from "lucide-react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Ingresar" };

const FEATURES = [
  { icon: Users, text: "Gestión de usuarios y roles con permisos granulares" },
  { icon: History, text: "Auditoría completa: quién, qué y cuándo" },
  { icon: ShieldCheck, text: "Sesiones seguras y renovación automática" },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel de marca */}
      <div className="relative hidden overflow-hidden bg-accent text-accent-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-foreground/10 ring-1 ring-accent-foreground/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            SHEIN Platform
          </span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            Acceso seguro a la plataforma.
          </h1>
          <p className="mt-4 text-base text-accent-foreground/70">
            Autenticación profesional, permisos por rol y trazabilidad de cada
            acción. La misma base para el panel, la app y la tienda.
          </p>

          <ul className="mt-10 space-y-4 text-sm">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-foreground/10">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-accent-foreground/80">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-accent-foreground/50">
          © {new Date().getFullYear()} SHEIN Platform
        </p>
      </div>

      {/* Panel del formulario */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold tracking-tight">
                SHEIN Platform
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">
              Bienvenido de nuevo
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Ingresá con tu cuenta para continuar.
            </p>
          </div>

          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
