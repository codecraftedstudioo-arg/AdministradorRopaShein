// Validaciones de Venta (Zod), compartidas por todas las apps.
import { z } from "zod";
import { CANALES_VENTA } from "../constants/catalogos";

export const registrarVentaSchema = z.object({
  canalVenta: z.enum(CANALES_VENTA),
  precioFinal: z
    .number()
    .int("El precio no puede tener decimales")
    .min(0, "El precio final debe ser mayor o igual a 0"),
  observaciones: z
    .string()
    .max(2000)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v.trim() : "")),
  // ISO o datetime-local; se normaliza a Date en el server (default: ahora).
  fechaVenta: z.string().optional(),
});
export type RegistrarVentaInput = z.infer<typeof registrarVentaSchema>;
