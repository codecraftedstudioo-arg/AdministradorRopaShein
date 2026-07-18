import {
  UserCircle,
  Users,
  ScrollText,
  LayoutGrid,
  Archive,
  ShoppingCart,
  Boxes,
  FileUp,
} from "lucide-react";
import { PERMISOS, type Permiso } from "@shein/shared";
import type { ComponentType } from "react";

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  permiso?: Permiso;
  exact?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Inventario",
    href: "/inventario",
    icon: LayoutGrid,
    permiso: PERMISOS.PRENDAS_VER,
  },
  {
    label: "Importar",
    href: "/inventario/importar",
    icon: FileUp,
    permiso: PERMISOS.PRENDAS_IMPORTAR,
  },
  {
    label: "Lotes",
    href: "/inventario/lotes",
    icon: Boxes,
    permiso: PERMISOS.LOTES_VER,
  },
  {
    label: "Ventas",
    href: "/ventas",
    icon: ShoppingCart,
    permiso: PERMISOS.VENTAS_VER,
  },
  {
    label: "Archivo",
    href: "/archivo",
    icon: Archive,
    permiso: PERMISOS.PRENDAS_VER,
  },
  {
    label: "Usuarios",
    href: "/usuarios",
    icon: Users,
    permiso: PERMISOS.USUARIOS_VER,
  },
  {
    label: "Auditoría",
    href: "/auditoria",
    icon: ScrollText,
    permiso: PERMISOS.AUDITORIA_VER,
  },
  { label: "Mi cuenta", href: "/cuenta", icon: UserCircle },
];
