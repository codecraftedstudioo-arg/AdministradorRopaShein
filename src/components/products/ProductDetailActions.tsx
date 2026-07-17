"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, DollarSign, Archive, RotateCcw } from "lucide-react";
import type { ProductStatus } from "@prisma/client";
import { SellModal } from "./SellModal";
import { Button, ConfirmDialog, useToast } from "@/components/ui";
import {
  archiveProductAction,
  restoreProductAction,
} from "@/app/(dashboard)/products/actions";

export function ProductDetailActions({
  id,
  name,
  status,
  priceCents,
  currentUserName,
}: {
  id: string;
  name: string;
  status: ProductStatus;
  priceCents: number;
  currentUserName: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [sellOpen, setSellOpen] = React.useState(false);
  const [archiveOpen, setArchiveOpen] = React.useState(false);

  const canSell = status === "AVAILABLE" || status === "RESERVED";

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/products/${id}/edit`}>
        <Button variant="outline">
          <Pencil className="h-4 w-4" /> Editar
        </Button>
      </Link>

      {canSell && (
        <Button onClick={() => setSellOpen(true)}>
          <DollarSign className="h-4 w-4" /> Vender
        </Button>
      )}

      {status === "ARCHIVED" ? (
        <Button
          variant="secondary"
          onClick={async () => {
            await restoreProductAction(id);
            toast("Prenda restaurada", "success");
            router.refresh();
          }}
        >
          <RotateCcw className="h-4 w-4" /> Restaurar
        </Button>
      ) : (
        <Button variant="outline" onClick={() => setArchiveOpen(true)}>
          <Archive className="h-4 w-4" /> Archivar
        </Button>
      )}

      <SellModal
        open={sellOpen}
        onClose={() => setSellOpen(false)}
        productId={id}
        productName={name}
        defaultPriceCents={priceCents}
        currentUserName={currentUserName}
      />
      <ConfirmDialog
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        onConfirm={async () => {
          await archiveProductAction(id);
          toast("Prenda archivada", "success");
          router.refresh();
        }}
        title="Archivar prenda"
        description={`¿Archivar "${name}"? Se conserva con todo su historial en el archivo.`}
        confirmLabel="Archivar"
        variant="danger"
      />
    </div>
  );
}
