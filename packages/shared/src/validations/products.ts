// Validaciones de Prenda (Zod), compartidas por todas las apps.
// El SKU (codigoInterno) se genera automáticamente y es inmutable.
import { z } from "zod";
import { GENEROS, CATEGORIAS, ESTADOS } from "../constants/catalogos";

const opcional = (schema: z.ZodString) =>
  schema.optional().or(z.literal("")).transform((v) => (v ? v.trim() : ""));

/** Imagen asociada a la prenda (ya subida; se guarda su URL). */
export const imagenInputSchema = z.object({
  url: z.string().min(1),
  orden: z.number().int().min(0),
  esPrincipal: z.boolean(),
});
export type ImagenInput = z.infer<typeof imagenInputSchema>;

export const crearPrendaSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre es obligatorio").max(120),
  descripcion: opcional(z.string().max(2000)),
  observaciones: opcional(z.string().max(2000)),
  genero: z.enum(GENEROS),
  categoria: z.enum(CATEGORIAS),
  subcategoria: opcional(z.string().max(80)),
  talle: z.string().trim().min(1, "El talle es obligatorio").max(20),
  precioVenta: z
    .number()
    .int("El precio no puede tener decimales")
    .min(0, "El precio no puede ser negativo"),
  costo: z
    .number()
    .int("El costo no puede tener decimales")
    .min(0, "El costo no puede ser negativo"),
  estado: z.enum(ESTADOS).optional(),
  loteId: z.string().uuid("Seleccioná un lote"),
  imagenes: z.array(imagenInputSchema).optional(),
});
export type CrearPrendaInput = z.infer<typeof crearPrendaSchema>;

/** En edición el SKU no se envía (es inmutable). */
export const editarPrendaSchema = crearPrendaSchema;
export type EditarPrendaInput = z.infer<typeof editarPrendaSchema>;
