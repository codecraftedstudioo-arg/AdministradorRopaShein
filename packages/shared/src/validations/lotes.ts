// Validaciones de Proveedor y Lote (Zod).
import { z } from "zod";

const opcional = (schema: z.ZodString) =>
  schema.optional().or(z.literal("")).transform((v) => (v ? v.trim() : ""));

export const crearProveedorSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre es obligatorio").max(80),
});
export type CrearProveedorInput = z.infer<typeof crearProveedorSchema>;

export const crearLoteSchema = z.object({
  numero: opcional(z.string().max(20)),
  proveedorId: z.string().uuid("Seleccioná un proveedor"),
  fechaIngreso: z.string().optional(),
  observaciones: opcional(z.string().max(2000)),
});
export type CrearLoteInput = z.infer<typeof crearLoteSchema>;

export const editarLoteSchema = z.object({
  proveedorId: z.string().uuid("Seleccioná un proveedor"),
  fechaIngreso: z.string().optional(),
  observaciones: opcional(z.string().max(2000)),
});
export type EditarLoteInput = z.infer<typeof editarLoteSchema>;
