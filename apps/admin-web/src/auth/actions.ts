"use server";

import { redirect } from "next/navigation";
import {
  loginSchema,
  ENTIDAD_AUDITORIA,
  ACCION_AUDITORIA,
} from "@shein/shared";
import { usuariosService, auditoriaService } from "@shein/database";
import { verifyPassword } from "@shein/auth/password";
import type { SesionUsuario } from "@shein/auth/session";
import { crearSesion, destruirSesion, obtenerSesion } from "./session";
import { logger } from "@/logger";

export interface LoginState {
  error?: string;
}

/** Convierte el campo Json `permisos` del rol en string[]. */
function permisosDeRol(permisos: unknown): string[] {
  return Array.isArray(permisos) ? (permisos as string[]) : [];
}

export async function iniciarSesion(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Revisá el email y la contraseña." };
  }

  const { email, password } = parsed.data;

  try {
    const usuario = await usuariosService.buscarPorEmail(email);
    // Mensaje genérico: no revelamos si el email existe.
    if (!usuario) return { error: "Credenciales incorrectas." };
    if (!usuario.activo) {
      return {
        error: "Tu cuenta está desactivada. Contactá a un administrador.",
      };
    }

    const ok = await verifyPassword(password, usuario.passwordHash);
    if (!ok) return { error: "Credenciales incorrectas." };

    const sesion: SesionUsuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rolClave: usuario.rol.clave,
      rolNombre: usuario.rol.nombre,
      permisos: permisosDeRol(usuario.rol.permisos),
    };

    await crearSesion(sesion);
    await usuariosService.registrarUltimoLogin(usuario.id);
    await auditoriaService.registrar({
      usuarioId: usuario.id,
      entidad: ENTIDAD_AUDITORIA.SESION,
      entidadId: usuario.id,
      accion: ACCION_AUDITORIA.LOGIN,
    });
    logger.event("Inicio de sesión", { usuarioId: usuario.id });

    return {};
  } catch (error) {
    logger.error("Fallo en inicio de sesión", error);
    return { error: "Ocurrió un error. Intentá nuevamente." };
  }
}

export async function cerrarSesion(): Promise<void> {
  const sesion = await obtenerSesion();
  if (sesion) {
    try {
      await auditoriaService.registrar({
        usuarioId: sesion.id,
        entidad: ENTIDAD_AUDITORIA.SESION,
        entidadId: sesion.id,
        accion: ACCION_AUDITORIA.LOGOUT,
      });
    } catch (error) {
      logger.error("No se pudo auditar el cierre de sesión", error);
    }
  }
  await destruirSesion();
  redirect("/login");
}
