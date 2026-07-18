// ============================================================
//  Motor de importación masiva de prendas (reutilizable).
//  Usado por admin-web, y preparado para mobile/API.
//  No depende de Prisma ni de Next: solo lógica pura.
// ============================================================

import {
  GENEROS,
  CATEGORIAS,
  ESTADOS,
  GENERO_LABELS,
  CATEGORIA_LABELS,
  ESTADO_LABELS,
  COSTO_POR_DEFECTO,
  type GeneroValor,
  type CategoriaValor,
  type EstadoValor,
} from "../constants/catalogos";

/** Campos del sistema que se pueden mapear desde un archivo. */
export const CAMPOS_IMPORTACION = [
  "sku",
  "lote",
  "proveedor",
  "nombre",
  "categoria",
  "subcategoria",
  "genero",
  "talle",
  "precio",
  "costo",
  "estado",
  "descripcion",
  "observaciones",
] as const;

export type CampoImportacion = (typeof CAMPOS_IMPORTACION)[number];

export const CAMPO_IMPORTACION_LABELS: Record<CampoImportacion, string> = {
  sku: "SKU",
  lote: "Lote",
  proveedor: "Proveedor",
  nombre: "Nombre",
  categoria: "Categoría",
  subcategoria: "Subcategoría",
  genero: "Género",
  talle: "Talle",
  precio: "Precio",
  costo: "Costo",
  estado: "Estado",
  descripcion: "Descripción",
  observaciones: "Observaciones",
};

/** Campos obligatorios en el mapeo (deben estar mapeados a una columna). */
export const CAMPOS_REQUERIDOS: CampoImportacion[] = [
  "lote",
  "nombre",
  "categoria",
  "genero",
  "talle",
  "precio",
];

/**
 * Aliases normalizados → campo del sistema.
 * Se usa para auto-detectar columnas del archivo.
 */
export const ALIASES_COLUMNA: Record<string, CampoImportacion> = {
  sku: "sku",
  codigo: "sku",
  codigointerno: "sku",
  "codigo interno": "sku",
  lote: "lote",
  "nro lote": "lote",
  nrolote: "lote",
  numerolote: "lote",
  "numero de lote": "lote",
  batch: "lote",
  proveedor: "proveedor",
  provider: "proveedor",
  supplier: "proveedor",
  nombre: "nombre",
  name: "nombre",
  producto: "nombre",
  prenda: "nombre",
  titulo: "nombre",
  categoria: "categoria",
  category: "categoria",
  subcategoria: "subcategoria",
  subcategory: "subcategoria",
  genero: "genero",
  género: "genero",
  gender: "genero",
  sexo: "genero",
  talle: "talle",
  size: "talle",
  talla: "talle",
  precio: "precio",
  price: "precio",
  precioventa: "precio",
  "precio venta": "precio",
  "precio de venta": "precio",
  costo: "costo",
  cost: "costo",
  costounitario: "costo",
  estado: "estado",
  status: "estado",
  descripcion: "descripcion",
  descripción: "descripcion",
  description: "descripcion",
  detalle: "descripcion",
  observaciones: "observaciones",
  notes: "observaciones",
  nota: "observaciones",
  notas: "observaciones",
  obs: "observaciones",
};

function normalizarHeader(h: string): string {
  return h
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

/** Sugiere el mejor campo del sistema para un header de columna. */
export function sugerirCampo(header: string): CampoImportacion | null {
  const n = normalizarHeader(header);
  if (ALIASES_COLUMNA[n]) return ALIASES_COLUMNA[n];
  // Coincidencia parcial
  for (const [alias, campo] of Object.entries(ALIASES_COLUMNA)) {
    if (n.includes(alias) || alias.includes(n)) return campo;
  }
  return null;
}

/** Auto-mapea todas las columnas del archivo. */
export function autoMapearColumnas(
  headers: string[],
): Record<string, CampoImportacion | ""> {
  const usados = new Set<CampoImportacion>();
  const map: Record<string, CampoImportacion | ""> = {};
  for (const h of headers) {
    const sugerido = sugerirCampo(h);
    if (sugerido && !usados.has(sugerido)) {
      map[h] = sugerido;
      usados.add(sugerido);
    } else {
      map[h] = "";
    }
  }
  return map;
}

export interface FilaCruda {
  /** Número de fila en el archivo (1 = header, datos desde 2). */
  fila: number;
  valores: Record<string, string>;
}

export interface FilaMapeada {
  fila: number;
  sku: string;
  lote: string;
  proveedor: string;
  nombre: string;
  categoria: string;
  subcategoria: string;
  genero: string;
  talle: string;
  precio: string;
  costo: string;
  estado: string;
  descripcion: string;
  observaciones: string;
}

export type SeveridadIssue = "error" | "warning";

export interface ImportIssue {
  fila: number;
  columna: string;
  severidad: SeveridadIssue;
  mensaje: string;
  solucion: string;
}

export interface FilaValidada {
  fila: number;
  sku: string | null; // null = generar automático
  loteNumero: string;
  proveedorNombre: string | null;
  nombre: string;
  categoria: CategoriaValor;
  subcategoria: string | null;
  genero: GeneroValor;
  talle: string;
  precioVenta: number;
  costo: number;
  estado: EstadoValor;
  descripcion: string | null;
  observaciones: string | null;
}

function celda(
  mapeo: Record<string, CampoImportacion | "">,
  valores: Record<string, string>,
  campo: CampoImportacion,
): string {
  const header = Object.entries(mapeo).find(([, c]) => c === campo)?.[0];
  if (!header) return "";
  return String(valores[header] ?? "").trim();
}

export function mapearFilas(
  filas: FilaCruda[],
  mapeo: Record<string, CampoImportacion | "">,
): FilaMapeada[] {
  return filas.map((f) => ({
    fila: f.fila,
    sku: celda(mapeo, f.valores, "sku"),
    lote: celda(mapeo, f.valores, "lote"),
    proveedor: celda(mapeo, f.valores, "proveedor"),
    nombre: celda(mapeo, f.valores, "nombre"),
    categoria: celda(mapeo, f.valores, "categoria"),
    subcategoria: celda(mapeo, f.valores, "subcategoria"),
    genero: celda(mapeo, f.valores, "genero"),
    talle: celda(mapeo, f.valores, "talle"),
    precio: celda(mapeo, f.valores, "precio"),
    costo: celda(mapeo, f.valores, "costo"),
    estado: celda(mapeo, f.valores, "estado"),
    descripcion: celda(mapeo, f.valores, "descripcion"),
    observaciones: celda(mapeo, f.valores, "observaciones"),
  }));
}

function parseMonto(raw: string): number | null {
  if (!raw) return null;
  const limpio = raw
    .replace(/\$/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  // Si quedó con punto decimal, tomar entero
  const n = Number(limpio.replace(/\..*$/, ""));
  if (Number.isNaN(n)) return null;
  return Math.round(n);
}

function resolverEnum<T extends string>(
  raw: string,
  valores: readonly T[],
  labels: Record<T, string>,
): T | null {
  if (!raw) return null;
  const n = normalizarHeader(raw);
  for (const v of valores) {
    if (normalizarHeader(v) === n) return v;
    if (normalizarHeader(labels[v]) === n) return v;
  }
  return null;
}

export interface ContextoValidacion {
  /** SKUs ya existentes en la BD. */
  skusExistentes: Set<string>;
  /** Números de lote existentes → { id, proveedorNombre }. */
  lotes: Map<string, { id: string; proveedorNombre: string }>;
}

/**
 * Valida todas las filas mapeadas.
 * - Errores → bloquean la importación.
 * - Warnings → no bloquean (defaults aplicados).
 */
export function validarImportacion(
  filas: FilaMapeada[],
  ctx: ContextoValidacion,
): { issues: ImportIssue[]; validas: FilaValidada[]; mapeoOk: boolean } {
  const issues: ImportIssue[] = [];
  const validas: FilaValidada[] = [];
  const skusEnArchivo = new Map<string, number>();

  for (const f of filas) {
    const filaIssues: ImportIssue[] = [];
    const push = (
      columna: string,
      severidad: SeveridadIssue,
      mensaje: string,
      solucion: string,
    ) => filaIssues.push({ fila: f.fila, columna, severidad, mensaje, solucion });

    // Nombre
    if (!f.nombre) {
      push("Nombre", "error", "El nombre es obligatorio.", "Completá la columna Nombre.");
    }

    // Lote
    let loteInfo: { id: string; proveedorNombre: string } | undefined;
    if (!f.lote) {
      push("Lote", "error", "El lote es obligatorio.", "Indicá el número de lote (ej: L001).");
    } else {
      loteInfo = ctx.lotes.get(f.lote.toUpperCase()) ?? ctx.lotes.get(f.lote);
      if (!loteInfo) {
        push(
          "Lote",
          "error",
          `El lote "${f.lote}" no existe.`,
          "Creá el lote en Inventario → Lotes o usá uno existente.",
        );
      }
    }

    // Proveedor (opcional, valida contra el lote)
    if (f.proveedor && loteInfo) {
      if (
        normalizarHeader(f.proveedor) !==
        normalizarHeader(loteInfo.proveedorNombre)
      ) {
        push(
          "Proveedor",
          "error",
          `El proveedor "${f.proveedor}" no coincide con el del lote (${loteInfo.proveedorNombre}).`,
          "Corregí el proveedor o el lote.",
        );
      }
    }

    // Categoría
    const categoria = resolverEnum(f.categoria, CATEGORIAS, CATEGORIA_LABELS);
    if (!f.categoria) {
      push("Categoría", "error", "La categoría es obligatoria.", `Usá: ${CATEGORIAS.join(", ")}.`);
    } else if (!categoria) {
      push(
        "Categoría",
        "error",
        `Categoría inválida: "${f.categoria}".`,
        `Valores permitidos: ${Object.values(CATEGORIA_LABELS).join(", ")}.`,
      );
    }

    // Género
    const genero = resolverEnum(f.genero, GENEROS, GENERO_LABELS);
    if (!f.genero) {
      push("Género", "error", "El género es obligatorio.", `Usá: ${Object.values(GENERO_LABELS).join(", ")}.`);
    } else if (!genero) {
      push(
        "Género",
        "error",
        `Género inválido: "${f.genero}".`,
        `Valores permitidos: ${Object.values(GENERO_LABELS).join(", ")}.`,
      );
    }

    // Talle
    if (!f.talle) {
      push("Talle", "error", "El talle es obligatorio.", "Completá la columna Talle.");
    }

    // Precio
    let precioVenta = 0;
    if (!f.precio) {
      push(
        "Precio",
        "error",
        "El precio es obligatorio.",
        "Indicá un precio mayor o igual a 0.",
      );
    } else {
      const p = parseMonto(f.precio);
      if (p === null) {
        push("Precio", "error", `Precio inválido: "${f.precio}".`, "Usá un número entero (ej: 15000).");
      } else if (p < 0) {
        push("Precio", "error", "El precio no puede ser negativo.", "Usá un valor ≥ 0.");
      } else {
        precioVenta = p;
      }
    }

    // Costo
    let costo = COSTO_POR_DEFECTO;
    if (!f.costo) {
      push(
        "Costo",
        "warning",
        "Costo vacío.",
        `Se utilizará $${COSTO_POR_DEFECTO.toLocaleString("es-AR")}.`,
      );
    } else {
      const c = parseMonto(f.costo);
      if (c === null) {
        push("Costo", "error", `Costo inválido: "${f.costo}".`, "Usá un número entero.");
      } else if (c < 0) {
        push("Costo", "error", "El costo no puede ser negativo.", "Usá un valor ≥ 0.");
      } else {
        costo = c;
      }
    }

    // Estado
    let estado: EstadoValor = "DISPONIBLE";
    if (!f.estado) {
      push("Estado", "warning", "Estado vacío.", "Se usará Disponible.");
    } else {
      const e = resolverEnum(f.estado, ESTADOS, ESTADO_LABELS);
      if (!e) {
        push(
          "Estado",
          "error",
          `Estado inválido: "${f.estado}".`,
          `Valores: ${Object.values(ESTADO_LABELS).join(", ")}.`,
        );
      } else {
        estado = e;
      }
    }

    // SKU
    let sku: string | null = null;
    if (f.sku) {
      const skuNorm = f.sku.trim().toUpperCase();
      if (ctx.skusExistentes.has(skuNorm) || ctx.skusExistentes.has(f.sku)) {
        push(
          "SKU",
          "error",
          `El SKU "${f.sku}" ya existe en la base de datos.`,
          "Usá otro SKU o dejalo vacío para generarlo automáticamente.",
        );
      } else if (skusEnArchivo.has(skuNorm)) {
        push(
          "SKU",
          "error",
          `SKU duplicado en el archivo (también en fila ${skusEnArchivo.get(skuNorm)}).`,
          "Cada SKU debe ser único.",
        );
      } else {
        skusEnArchivo.set(skuNorm, f.fila);
        sku = f.sku.trim();
      }
    }

    issues.push(...filaIssues);

    const tieneError = filaIssues.some((i) => i.severidad === "error");
    if (!tieneError && f.nombre && loteInfo && categoria && genero && f.talle) {
      validas.push({
        fila: f.fila,
        sku,
        loteNumero: f.lote,
        proveedorNombre: f.proveedor || null,
        nombre: f.nombre,
        categoria,
        subcategoria: f.subcategoria || null,
        genero,
        talle: f.talle,
        precioVenta,
        costo,
        estado,
        descripcion: f.descripcion || null,
        observaciones: f.observaciones || null,
      });
    }
  }

  return {
    issues,
    validas,
    mapeoOk: true,
  };
}

/** Encabezados de la plantilla Excel/CSV. */
export const PLANTILLA_HEADERS = [
  "SKU",
  "Lote",
  "Proveedor",
  "Nombre",
  "Categoría",
  "Subcategoría",
  "Género",
  "Talle",
  "Precio",
  "Costo",
  "Estado",
  "Descripción",
  "Observaciones",
] as const;

/** Filas de ejemplo para la plantilla. */
export const PLANTILLA_EJEMPLOS: string[][] = [
  [
    "",
    "L001",
    "SHEIN",
    "Remera oversize negra",
    "Remera",
    "Oversize",
    "Mujer",
    "M",
    "15000",
    "6000",
    "Disponible",
    "Remera de algodón",
    "Mystery box marzo",
  ],
  [
    "",
    "L001",
    "SHEIN",
    "Pack x3 boxers",
    "Pantalón",
    "Pack",
    "Hombre",
    "L",
    "12000",
    "",
    "",
    "Pack de 3 unidades (un producto)",
    "",
  ],
];
