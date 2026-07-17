import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Tag as TagIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductDetailActions } from "@/components/products/ProductDetailActions";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  StatusBadge,
} from "@/components/ui";
import { requireAuth } from "@/lib/auth";
import { getProductById } from "@/services/productService";
import { getEntityHistory } from "@/services/auditService";
import { formatCurrency, formatDate } from "@/lib/utils";
import { GENDER_LABELS, CHANNEL_LABELS } from "@/utils/constants";
import type { AuditLogWithActor } from "@/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  return { title: product?.name ?? "Prenda" };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAuth();
  const product = await getProductById(id);
  if (!product) notFound();

  const history = await getEntityHistory("PRODUCT", id);

  return (
    <div className="animate-fade-in-up">
      <Link
        href="/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a productos
      </Link>

      <PageHeader
        title={product.name}
        description={`Código ${product.internalCode}`}
        action={
          <ProductDetailActions
            id={product.id}
            name={product.name}
            status={product.status}
            priceCents={product.priceCents}
            currentUserName={user.name}
          />
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Galería */}
        <div className="lg:col-span-1">
          <ProductGallery
            images={product.images.map((i) => ({
              url: i.url,
              isPrimary: i.isPrimary,
            }))}
            name={product.name}
          />
        </div>

        {/* Info */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Información</CardTitle>
              <StatusBadge status={product.status} />
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                <Field label="Precio">
                  <span className="text-lg font-semibold tabular-nums">
                    {formatCurrency(product.priceCents)}
                  </span>
                </Field>
                <Field label="Categoría">{product.category.name}</Field>
                <Field label="Subcategoría">{product.subcategory.name}</Field>
                <Field label="Género">{GENDER_LABELS[product.gender]}</Field>
                <Field label="Talle">{product.size}</Field>
                <Field label="Fecha de ingreso">
                  {formatDate(product.intakeAt)}
                </Field>
                <Field label="Cargada por">{product.createdBy.name}</Field>
                {product.updatedBy && (
                  <Field label="Última modificación por">
                    {product.updatedBy.name}
                  </Field>
                )}
              </dl>

              {product.description && (
                <div className="mt-6 border-t border-[var(--border)] pt-4">
                  <p className="mb-1 text-xs font-medium text-muted">
                    Descripción
                  </p>
                  <p className="text-sm text-foreground">
                    {product.description}
                  </p>
                </div>
              )}

              {product.tags.length > 0 && (
                <div className="mt-6 border-t border-[var(--border)] pt-4">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted">
                    <TagIcon className="h-3.5 w-3.5" /> Etiquetas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map(({ tag }) => (
                      <Badge
                        key={tag.id}
                        className="bg-surface-2 text-foreground ring-[var(--border)]"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: tag.color ?? "#999" }}
                        />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Venta */}
          {product.sale && (
            <Card>
              <CardHeader>
                <CardTitle>Detalle de venta</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                  <Field label="Precio final">
                    <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(product.sale.finalPriceCents)}
                    </span>
                  </Field>
                  <Field label="Canal">
                    {CHANNEL_LABELS[product.sale.channel]}
                  </Field>
                  <Field label="Vendedor">{product.sale.sellerName}</Field>
                  <Field label="Fecha">
                    {formatDate(product.sale.soldAt, true)}
                  </Field>
                  {product.sale.notes && (
                    <Field label="Observaciones" className="col-span-2 sm:col-span-3">
                      {product.sale.notes}
                    </Field>
                  )}
                </dl>
              </CardContent>
            </Card>
          )}

          {/* Historial */}
          <Card>
            <CardHeader>
              <CardTitle>Historial y actividad</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ActivityFeed items={history as AuditLogWithActor[]} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="mb-0.5 text-xs font-medium text-muted">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}
