import {
  LayoutDashboard,
  Shirt,
  Archive,
  BarChart3,
  History,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@prisma/client";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: Role[]; // si no se define, visible para todos
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Productos", href: "/products", icon: Shirt },
  { label: "Archivo", href: "/archive", icon: Archive },
  { label: "Estadísticas", href: "/statistics", icon: BarChart3 },
  { label: "Auditoría", href: "/audit", icon: History, roles: ["ADMIN"] },
  { label: "Usuarios", href: "/users", icon: Users, roles: ["ADMIN"] },
];
