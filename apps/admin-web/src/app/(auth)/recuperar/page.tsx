import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MailQuestion } from "lucide-react";

export const metadata: Metadata = { title: "Recuperar contraseña" };

// Arquitectura preparada: la recuperación por email se implementará más
// adelante (modelo TokenRecuperacion + servicio ya existen). Esta pantalla
// es un stub, sin envío de emails todavía.
export default function RecuperarPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2">
          <MailQuestion className="h-6 w-6 text-muted" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Recuperar contraseña
        </h1>
        <p className="mt-2 text-sm text-muted">
          La recuperación por email estará disponible próximamente. Mientras
          tanto, pedile a un administrador que restablezca tu contraseña desde
          el panel de usuarios.
        </p>

        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground transition-opacity hover:opacity-70"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}
