import type { Metadata } from "next";
import { importService } from "@shein/database";
import { PERMISOS } from "@shein/shared";
import { requirePermiso } from "@/auth/guards";
import { PageHeader } from "@/components/layout/PageHeader";
import { ImportWizard } from "@/components/inventory/ImportWizard";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Importar prendas" };

export default async function ImportarPage() {
  await requirePermiso(PERMISOS.PRENDAS_IMPORTAR);
  const historial = await importService.listarHistorial(1, 15);

  return (
    <div>
      <PageHeader
        title="Importación masiva"
        description="Importá cientos o miles de prendas desde Excel o CSV. Todo se valida antes de guardar."
      />
      <ImportWizard
        historial={historial.map((h) => ({
          id: h.id,
          archivo: h.archivoNombre,
          estado: h.estado,
          importadas: h.cantidadImportada,
          rechazadas: h.cantidadRechazada,
          usuario: `${h.usuario.nombre} ${h.usuario.apellido}`,
          fecha: formatDate(h.createdAt, true),
          duracionMs: h.duracionMs,
        }))}
      />
    </div>
  );
}
