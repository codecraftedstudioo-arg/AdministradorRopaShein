// Validaciones de Configuración (Zod). Estructura preparada; sin reglas aún.
//
// Campos previstos: clave, valor, tipo?, descripcion?.
import { z } from "zod";

export const configuracionSchema = z.object({});
export type ConfiguracionInput = z.infer<typeof configuracionSchema>;
