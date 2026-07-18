// Servicio de acceso a datos: Recuperación de contraseña.
//
// ARQUITECTURA PREPARADA. En esta etapa NO se implementa el envío de emails
// ni el flujo completo. El modelo `TokenRecuperacion` ya existe en el schema
// (hash de token + expiración + un solo uso) para completar esto más adelante.
//
// import { prisma } from "../client";

export const recuperacionService = {
  // TODO: generar token, guardar su hash con expiración y disparar email.
  async solicitar(_email: string): Promise<void> {
    throw new Error(
      "Recuperación de contraseña: arquitectura preparada, pendiente de implementación.",
    );
  },

  // TODO: validar token (hash + expiración + no usado) y cambiar la contraseña.
  async restablecer(_token: string, _nuevaPassword: string): Promise<void> {
    throw new Error(
      "Recuperación de contraseña: arquitectura preparada, pendiente de implementación.",
    );
  },
};
