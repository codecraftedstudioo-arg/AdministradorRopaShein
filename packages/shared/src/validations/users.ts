// Validaciones de Usuario (Zod), compartidas por todas las apps.
import { z } from "zod";

const email = z
  .string()
  .min(1, "El email es obligatorio")
  .email("Email inválido")
  .max(160)
  .transform((v) => v.trim().toLowerCase());

const nombre = z
  .string()
  .min(2, "El nombre debe tener al menos 2 caracteres")
  .max(80)
  .transform((v) => v.trim());

const apellido = z
  .string()
  .min(2, "El apellido debe tener al menos 2 caracteres")
  .max(80)
  .transform((v) => v.trim());

const password = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(72, "La contraseña es demasiado larga");

/** Alta de usuario. */
export const crearUsuarioSchema = z.object({
  nombre,
  apellido,
  email,
  password,
  rolId: z.string().uuid("Rol inválido"),
});
export type CrearUsuarioInput = z.infer<typeof crearUsuarioSchema>;

/** Edición de datos de usuario (sin contraseña ni rol). */
export const editarUsuarioSchema = z.object({
  nombre,
  apellido,
  email,
});
export type EditarUsuarioInput = z.infer<typeof editarUsuarioSchema>;

/** Cambio de contraseña por un administrador. */
export const cambiarPasswordSchema = z.object({
  password,
});
export type CambiarPasswordInput = z.infer<typeof cambiarPasswordSchema>;

/** Cambio de contraseña propia (requiere la actual). */
export const cambiarMiPasswordSchema = z
  .object({
    passwordActual: z.string().min(1, "Ingresá tu contraseña actual"),
    passwordNueva: password,
    passwordConfirmacion: z.string().min(1, "Confirmá la nueva contraseña"),
  })
  .refine((d) => d.passwordNueva === d.passwordConfirmacion, {
    message: "Las contraseñas no coinciden",
    path: ["passwordConfirmacion"],
  });
export type CambiarMiPasswordInput = z.infer<typeof cambiarMiPasswordSchema>;

/** Cambio de rol. */
export const cambiarRolSchema = z.object({
  rolId: z.string().uuid("Rol inválido"),
});
export type CambiarRolInput = z.infer<typeof cambiarRolSchema>;
