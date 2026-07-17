import type {
  Gender,
  ProductStatus,
  SaleChannel,
  Role,
  AuditAction,
  AuditEntity,
} from "@prisma/client";

/** Etiquetas legibles para las acciones de auditoría. */
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: "Creación",
  UPDATE: "Modificación",
  STATUS_CHANGE: "Cambio de estado",
  PRICE_CHANGE: "Cambio de precio",
  SELL: "Venta",
  ARCHIVE: "Archivado",
  RESTORE: "Restauración",
  LOGIN: "Inicio de sesión",
  LOGOUT: "Cierre de sesión",
  IMPORT: "Importación",
};

/** Etiquetas legibles para las entidades de auditoría. */
export const AUDIT_ENTITY_LABELS: Record<AuditEntity, string> = {
  PRODUCT: "Prenda",
  SALE: "Venta",
  USER: "Usuario",
  CATEGORY: "Categoría",
  TAG: "Etiqueta",
  SESSION: "Sesión",
};

/** Etiquetas legibles para los estados de producto. */
export const STATUS_LABELS: Record<ProductStatus, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservada",
  SOLD: "Vendida",
  ARCHIVED: "Archivada",
};

/** Colores (clases Tailwind) para los badges de estado. */
export const STATUS_STYLES: Record<ProductStatus, string> = {
  AVAILABLE:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  RESERVED:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  SOLD: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
  ARCHIVED:
    "bg-neutral-100 text-neutral-600 ring-neutral-500/20 dark:bg-neutral-500/10 dark:text-neutral-400 dark:ring-neutral-500/20",
};

/** Etiquetas legibles para el género. */
export const GENDER_LABELS: Record<Gender, string> = {
  WOMAN: "Mujer",
  MAN: "Hombre",
  KID: "Niño",
};

/** Etiquetas legibles para los canales de venta. */
export const CHANNEL_LABELS: Record<SaleChannel, string> = {
  LOCAL: "Local",
  ONLINE: "Online",
  PARTICULAR: "Particular",
};

/** Etiquetas legibles para los roles. */
export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  EMPLOYEE: "Empleado",
};

/**
 * Estructura de categorías por defecto.
 * Mujer / Hombre / Niño -> subcategorías compartidas.
 */
export const DEFAULT_SUBCATEGORIES = [
  "Remeras",
  "Buzos",
  "Camisas",
  "Pantalones",
  "Camperas",
  "Zapatillas",
] as const;

export const DEFAULT_CATEGORIES = ["Mujer", "Hombre", "Niño"] as const;

/** Talles disponibles. */
export const SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "Único",
  "34",
  "36",
  "38",
  "40",
  "42",
  "44",
] as const;

/** Etiquetas (tags) sugeridas para el inventario. */
export const DEFAULT_TAGS = [
  { name: "Oversize", color: "#8b5cf6" },
  { name: "Vintage", color: "#d97706" },
  { name: "Y2K", color: "#ec4899" },
  { name: "Invierno", color: "#0ea5e9" },
  { name: "Verano", color: "#f59e0b" },
  { name: "Nuevo ingreso", color: "#10b981" },
  { name: "Oferta", color: "#ef4444" },
] as const;

/** Prefijo para los códigos internos generados automáticamente. */
export const INTERNAL_CODE_PREFIX = "SHN";
