"use client";

import * as React from "react";
import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Eye,
  Pencil,
  ShoppingCart,
  Archive,
  Copy,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { PERMISOS } from "@shein/shared";
import { Button, ConfirmDialog } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { usePermissions } from "@/hooks/usePermissions";
import { SellModal } from "./SellModal";
import {
  archivarPrenda,
  duplicarPrenda,
  reservarPrenda,
  liberarPrenda,
} from "@/app/(app)/inventario/actions";

export interface PrendaAccion {
  id: string;
  nombre: string;
  codigoInterno: string;
  precioVenta: number;
  estado: string;
}

export function ProductActions({
  prenda,
  layout = "menu",
}: {
  prenda: PrendaAccion;
  layout?: "menu" | "bar";
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { can } = usePermissions();
  const [pending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [sellOpen, setSellOpen] = React.useState(false);
  const [archiveOpen, setArchiveOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const puedeVender =
    can(PERMISOS.VENTAS_REGISTRAR) &&
    (prenda.estado === "DISPONIBLE" || prenda.estado === "RESERVADA");
  const puedeEditar = can(PERMISOS.PRENDAS_EDITAR);
  const puedeArchivar =
    can(PERMISOS.PRENDAS_ARCHIVAR) &&
    prenda.estado !== "ARCHIVADA" &&
    prenda.estado !== "VENDIDA";
  const puedeDuplicar = can(PERMISOS.PRENDAS_CREAR);
  const puedeReservar =
    puedeEditar && prenda.estado === "DISPONIBLE";
  const puedeLiberar =
    puedeEditar && prenda.estado === "RESERVADA";

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const archivar = () =>
    startTransition(async () => {
      const res = await archivarPrenda(prenda.id);
      if (res.ok) {
        toast("Prenda archivada", "success");
        router.refresh();
      } else {
        toast(res.error ?? "No se pudo archivar", "error");
      }
      setArchiveOpen(false);
    });

  const duplicar = () =>
    startTransition(async () => {
      const res = await duplicarPrenda(prenda.id);
      if (res.ok && res.id) {
        toast("Prenda duplicada", "success");
        router.push(`/inventario/prendas/${res.id}/editar`);
      } else {
        toast(res.error ?? "No se pudo duplicar", "error");
      }
    });

  const reservar = () =>
    startTransition(async () => {
      const res = await reservarPrenda(prenda.id);
      if (res.ok) {
        toast("Prenda reservada", "success");
        router.refresh();
      } else {
        toast(res.error ?? "No se pudo reservar", "error");
      }
    });

  const liberar = () =>
    startTransition(async () => {
      const res = await liberarPrenda(prenda.id);
      if (res.ok) {
        toast("Prenda liberada", "success");
        router.refresh();
      } else {
        toast(res.error ?? "No se pudo liberar", "error");
      }
    });

  const sellModal = (
    <SellModal open={sellOpen} onClose={() => setSellOpen(false)} prenda={prenda} />
  );
  const archiveDialog = (
    <ConfirmDialog
      open={archiveOpen}
      onClose={() => setArchiveOpen(false)}
      onConfirm={archivar}
      title="Archivar prenda"
      description={`${prenda.nombre} pasará al Archivo y saldrá del inventario activo.`}
      confirmLabel="Archivar"
      variant="danger"
    />
  );

  if (layout === "bar") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {puedeVender && (
          <Button onClick={() => setSellOpen(true)}>
            <ShoppingCart className="h-4 w-4" />
            Registrar venta
          </Button>
        )}
        {puedeEditar && (
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/inventario/prendas/${prenda.id}/editar`)
            }
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        )}
        {puedeReservar && (
          <Button variant="ghost" onClick={reservar} loading={pending}>
            <Bookmark className="h-4 w-4" />
            Reservar
          </Button>
        )}
        {puedeLiberar && (
          <Button variant="ghost" onClick={liberar} loading={pending}>
            <BookmarkCheck className="h-4 w-4" />
            Liberar
          </Button>
        )}
        {puedeDuplicar && (
          <Button variant="ghost" onClick={duplicar} loading={pending}>
            <Copy className="h-4 w-4" />
            Duplicar
          </Button>
        )}
        {puedeArchivar && (
          <Button variant="ghost" onClick={() => setArchiveOpen(true)}>
            <Archive className="h-4 w-4" />
            Archivar
          </Button>
        )}
        {sellModal}
        {archiveDialog}
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Acciones"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {menuOpen && (
        <div className="card-surface animate-scale-in absolute right-0 z-20 mt-1 w-48 overflow-hidden p-1.5 text-sm">
          <MenuLink href={`/inventario/prendas/${prenda.id}`} icon={Eye}>
            Ver
          </MenuLink>
          {puedeEditar && (
            <MenuLink
              href={`/inventario/prendas/${prenda.id}/editar`}
              icon={Pencil}
            >
              Editar
            </MenuLink>
          )}
          {puedeVender && (
            <MenuButton
              icon={ShoppingCart}
              onClick={() => {
                setMenuOpen(false);
                setSellOpen(true);
              }}
            >
              Registrar venta
            </MenuButton>
          )}
          {puedeReservar && (
            <MenuButton
              icon={Bookmark}
              onClick={() => {
                setMenuOpen(false);
                reservar();
              }}
            >
              Reservar
            </MenuButton>
          )}
          {puedeLiberar && (
            <MenuButton
              icon={BookmarkCheck}
              onClick={() => {
                setMenuOpen(false);
                liberar();
              }}
            >
              Liberar
            </MenuButton>
          )}
          {puedeDuplicar && (
            <MenuButton
              icon={Copy}
              onClick={() => {
                setMenuOpen(false);
                duplicar();
              }}
            >
              Duplicar
            </MenuButton>
          )}
          {puedeArchivar && (
            <MenuButton
              icon={Archive}
              danger
              onClick={() => {
                setMenuOpen(false);
                setArchiveOpen(true);
              }}
            >
              Archivar
            </MenuButton>
          )}
        </div>
      )}

      {sellModal}
      {archiveDialog}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-surface-2"
    >
      <Icon className="h-4 w-4 text-muted" />
      {children}
    </Link>
  );
}

function MenuButton({
  icon: Icon,
  children,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-2 ${
        danger ? "text-red-600 dark:text-red-400" : ""
      }`}
    >
      <Icon className="h-4 w-4 opacity-70" />
      {children}
    </button>
  );
}
