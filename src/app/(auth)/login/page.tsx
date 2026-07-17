import { Suspense } from "react";
import type { Metadata } from "next";
import { Shirt, ShieldCheck, Sparkles, History } from "lucide-react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Ingresar" };

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel de marca */}
      <div className="relative hidden overflow-hidden bg-accent text-accent-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-foreground/10 ring-1 ring-accent-foreground/20">
            <Shirt className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            SHEIN Inventory
          </span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            Gestión profesional de prendas únicas.
          </h1>
          <p className="mt-4 text-base text-accent-foreground/70">
            Cada prenda es única. Controlá ingresos, ventas y archivo con
            trazabilidad completa de cada acción.
          </p>

          <ul className="mt-10 space-y-4 text-sm">
            {[
              { icon: Sparkles, text: "Inventario de piezas únicas sin stock múltiple" },
              { icon: History, text: "Auditoría completa: quién, qué y cuándo" },
              { icon: ShieldCheck, text: "Acceso por roles y sesiones seguras" },
            ].map(({ icon: Icon, text }) => (
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
          © {new Date().getFullYear()} SHEIN Inventory · Panel de administración
        </p>
      </div>

      {/* Panel del formulario */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Shirt className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold tracking-tight">
                SHEIN Inventory
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">
              Bienvenido de nuevo
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Ingresá con tu cuenta para gestionar el inventario.
            </p>
          </div>

          <Suspense>
            <LoginForm />
          </Suspense>

          <div className="mt-8 rounded-xl border border-[var(--border)] bg-surface-2 p-4">
            <p className="text-xs font-medium text-muted">
              Credenciales de demostración
            </p>
            <div className="mt-2 grid gap-1 font-mono text-xs text-foreground/80">
              <span>admin@shein.local · admin123</span>
              <span>empleado@shein.local · empleado123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
