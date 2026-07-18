import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prendasService, lotesService } from "@shein/database";
import { PERMISOS } from "@shein/shared";
import { requirePermiso } from "@/auth/guards";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductForm } from "@/components/inventory/ProductForm";

export const metadata: Metadata = { title: "Editar prenda" };

export default async function EditarPrendaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermiso(PERMISOS.PRENDAS_EDITAR);
  const { id } = await params;
  const [prenda, lotes] = await Promise.all([
    prendasService.buscarPorId(id),
    lotesService.listarOpciones(),
  ]);
  if (!prenda) notFound();

  return (
    <div>
      <PageHeader
        title="Editar prenda"
        description={`${prenda.nombre} · ${prenda.codigoInterno}`}
      />
      <ProductForm
        modo="editar"
        prendaId={prenda.id}
        lotes={lotes.map((l) => ({
          id: l.id,
          numero: l.numero,
          proveedor: l.proveedor.nombre,
          proveedorId: l.proveedor.id,
        }))}
        valorInicial={{
          codigoInterno: prenda.codigoInterno,
          nombre: prenda.nombre,
          descripcion: prenda.descripcion ?? "",
          observaciones: prenda.observaciones ?? "",
          genero: prenda.genero,
          categoria: prenda.categoria,
          subcategoria: prenda.subcategoria ?? "",
          talle: prenda.talle,
          precioVenta: prenda.precioVenta,
          costo: prenda.costo,
          estado: prenda.estado,
          loteId: prenda.loteId,
          imagenes: prenda.imagenes.map((img) => ({
            url: img.url,
            orden: img.orden,
            esPrincipal: img.esPrincipal,
          })),
        }}
      />
    </div>
  );
}
