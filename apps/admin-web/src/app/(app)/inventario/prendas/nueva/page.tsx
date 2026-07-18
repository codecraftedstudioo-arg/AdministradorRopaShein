import type { Metadata } from "next";
import { lotesService } from "@shein/database";
import { PERMISOS } from "@shein/shared";
import { requirePermiso } from "@/auth/guards";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductForm } from "@/components/inventory/ProductForm";

export const metadata: Metadata = { title: "Nueva prenda" };

export default async function NuevaPrendaPage() {
  await requirePermiso(PERMISOS.PRENDAS_CREAR);
  const lotes = await lotesService.listarOpciones();

  return (
    <div>
      <PageHeader
        title="Nueva prenda"
        description="Cada bolsa SHEIN es un producto único. El SKU se genera automáticamente."
      />
      <ProductForm
        modo="crear"
        lotes={lotes.map((l) => ({
          id: l.id,
          numero: l.numero,
          proveedor: l.proveedor.nombre,
          proveedorId: l.proveedor.id,
        }))}
      />
    </div>
  );
}
