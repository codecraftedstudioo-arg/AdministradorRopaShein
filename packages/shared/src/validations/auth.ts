// Validaciones de autenticación (Zod).
import { z } from "zod";

/** Inicio de sesión. */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Email inválido")
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1, "La contraseña es obligatoria"),
});
export type LoginInput = z.infer<typeof loginSchema>;

/** Solicitud de recuperación de contraseña (arquitectura preparada). */
export const solicitarRecuperacionSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Email inválido")
    .transform((v) => v.trim().toLowerCase()),
});
export type SolicitarRecuperacionInput = z.infer<
  typeof solicitarRecuperacionSchema
>;

/** Restablecimiento con token (arquitectura preparada). */
export const restablecerPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    passwordConfirmacion: z.string().min(1),
  })
  .refine((d) => d.password === d.passwordConfirmacion, {
    message: "Las contraseñas no coinciden",
    path: ["passwordConfirmacion"],
  });
export type RestablecerPasswordInput = z.infer<
  typeof restablecerPasswordSchema
>;
