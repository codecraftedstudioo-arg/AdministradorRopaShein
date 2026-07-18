// Catálogos de dominio del inventario. Los valores coinciden 1:1 con los
// enums de Prisma (Genero, Categoria, Estado, CanalVenta). Se definen acá como
// uniones de strings para ser reutilizados por web/mobile/store sin depender
// del cliente de Prisma.

// ---------- Género ----------
export const GENEROS = ["MUJER", "HOMBRE", "NINO"] as const;
export type GeneroValor = (typeof GENEROS)[number];
export const GENERO_LABELS: Record<GeneroValor, string> = {
  MUJER: "Mujer",
  HOMBRE: "Hombre",
  NINO: "Niño",
};

// ---------- Categoría ----------
export const CATEGORIAS = [
  "REMERA",
  "BUZO",
  "CAMISA",
  "PANTALON",
  "CAMPERA",
  "ZAPATILLA",
] as const;
export type CategoriaValor = (typeof CATEGORIAS)[number];
export const CATEGORIA_LABELS: Record<CategoriaValor, string> = {
  REMERA: "Remera",
  BUZO: "Buzo",
  CAMISA: "Camisa",
  PANTALON: "Pantalón",
  CAMPERA: "Campera",
  ZAPATILLA: "Zapatilla",
};

// ---------- Estado ----------
export const ESTADOS = ["DISPONIBLE", "RESERVADA", "VENDIDA", "ARCHIVADA"] as const;
export type EstadoValor = (typeof ESTADOS)[number];
export const ESTADO_LABELS: Record<EstadoValor, string> = {
  DISPONIBLE: "Disponible",
  RESERVADA: "Reservada",
  VENDIDA: "Vendida",
  ARCHIVADA: "Archivada",
};
/** Clases Tailwind para el badge de estado (bg + text + ring). */
export const ESTADO_BADGE: Record<EstadoValor, string> = {
  DISPONIBLE:
    "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
  RESERVADA:
    "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400",
  VENDIDA: "bg-blue-500/10 text-blue-600 ring-blue-500/20 dark:text-blue-400",
  ARCHIVADA:
    "bg-neutral-500/10 text-neutral-600 ring-neutral-500/20 dark:text-neutral-400",
};

/** Estados que forman parte del inventario activo. */
export const ESTADOS_ACTIVOS: EstadoValor[] = ["DISPONIBLE", "RESERVADA"];
/** Estados que se muestran en el Archivo. */
export const ESTADOS_ARCHIVO: EstadoValor[] = ["VENDIDA", "ARCHIVADA"];

// ---------- Canal de venta ----------
export const CANALES_VENTA = ["LOCAL", "ONLINE", "PARTICULAR"] as const;
export type CanalVentaValor = (typeof CANALES_VENTA)[number];
export const CANAL_VENTA_LABELS: Record<CanalVentaValor, string> = {
  LOCAL: "Local",
  ONLINE: "Online",
  PARTICULAR: "Particular",
};
/** Clases Tailwind para el badge de canal de venta. */
export const CANAL_VENTA_BADGE: Record<CanalVentaValor, string> = {
  LOCAL:
    "bg-violet-500/10 text-violet-600 ring-violet-500/20 dark:text-violet-400",
  ONLINE: "bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-400",
  PARTICULAR:
    "bg-teal-500/10 text-teal-600 ring-teal-500/20 dark:text-teal-400",
};

// ---------- Reglas de negocio ----------
/** Costo por defecto de una prenda (modificable en el alta). */
export const COSTO_POR_DEFECTO = 6000;

/** Prefijo del SKU inmutable (LS-000001). */
export const SKU_PREFIJO = "LS";

/** Prefijo del número de lote (L001). */
export const LOTE_PREFIJO = "L";
