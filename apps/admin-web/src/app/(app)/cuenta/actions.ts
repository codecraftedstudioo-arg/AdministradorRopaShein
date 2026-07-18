"use server";

import {
  cambiarMiPasswordSchema,
  ENTIDAD_AUDITORIA,
  ACCION_AUDITORIA,
} from "@shein/shared";
import { usuariosService, auditoriaService } from "@shein/database";
import { verifyPassword } from "@shein/auth/password";
import { requireSesion } from "@/auth/guards";
import { logger } from "@/logger";

export interface FormResult {
  ok?: boolean;
  error?: string;
}

export async function cambiarMiPassword(
  _prev: FormResult,
  formData: FormData,
): Promise<FormResult> {
  const sesion = await requireSesion();

  const parsed = cambiarMiPasswordSchema.safeParse({
    passwordActual: formData.get("passwordActual"),
    passwordNueva: formData.get("passwordNueva"),
    passwordConfirmacion: formData.get("passwordConfirmacion"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const usuario = await usuariosService.buscarPorId(sesion.id);
    if (!usuario) return { error: "Usuario no encontrado." };

    const ok = await verifyPassword(
      parsed.data.passwordActual,
      usuario.passwordHash,
    );
    if (!ok) return { error: "La contraseña actual es incorrecta." };

    await usuariosService.cambiarPassword(sesion.id, parsed.data.passwordNueva);
    await auditoriaService.registrar({
      usuarioId: sesion.id,
      entidad: ENTIDAD_AUDITORIA.USUARIO,
      entidadId: sesion.id,
      accion: ACCION_AUDITORIA.CAMBIAR_PASSWORD,
    });
    return { ok: true };
  } catch (error) {
    logger.error("Error al cambiar la contraseña propia", error);
    return { error: "No se pudo cambiar la contraseña." };
  }
}
