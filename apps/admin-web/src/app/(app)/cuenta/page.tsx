import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { usuariosService } from "@shein/database";
import { requireSesion } from "@/auth/guards";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { MiPasswordForm } from "./MiPasswordForm";

export const metadata: Metadata = { title: "Mi cuenta" };

function Dato({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export default async function CuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ forbidden?: string }>;
}) {
  const sesion = await requireSesion();
  const { forbidden } = await searchParams;
  const usuario = await usuariosService.buscarPorId(sesion.id);

  return (
    <div>
      <PageHeader
        title="Mi cuenta"
        description="Tus datos de perfil y seguridad."
      />

      {forbidden && (
        <div className="animate-fade-in mb-6 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          No tenés permisos para acceder a esa sección.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-5">
              <Dato label="Nombre" value={sesion.nombre} />
              <Dato label="Apellido" value={sesion.apellido} />
              <Dato label="Email" value={sesion.email} />
              <Dato label="Rol" value={sesion.rolNombre} />
              {usuario?.ultimoLogin && (
                <Dato
                  label="Último ingreso"
                  value={formatDate(usuario.ultimoLogin, true)}
                />
              )}
              {usuario?.createdAt && (
                <Dato
                  label="Miembro desde"
                  value={formatDate(usuario.createdAt)}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <MiPasswordForm />
      </div>
    </div>
  );
}
