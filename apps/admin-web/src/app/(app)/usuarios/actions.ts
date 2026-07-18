"use server";

import { revalidatePath } from "next/cache";
import {
  crearUsuarioSchema,
  editarUsuarioSchema,
  cambiarPasswordSchema,
  cambiarRolSchema,
  PERMISOS,
  ENTIDAD_AUDITORIA,
  ACCION_AUDITORIA,
} from "@shein/shared";
import { usuariosService, auditoriaService } from "@shein/database";
import { requirePermiso } from "@/auth/guards";
import { logger } from "@/logger";

export interface ActionResult {
  ok?: boolean;
  error?: string;
}

export async function crearUsuario(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await requirePermiso(PERMISOS.USUARIOS_CREAR);

  const parsed = crearUsuarioSchema.safeParse({
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    email: formData.get("email"),
    password: formData.get("password"),
    rolId: formData.get("rolId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    if (await usuariosService.emailEnUso(parsed.data.email)) {
      return { error: "Ya existe un usuario con ese email." };
    }
    const usuario = await usuariosService.crear(parsed.data);
    await auditoriaService.registrar({
      usuarioId: actor.id,
      entidad: ENTIDAD_AUDITORIA.USUARIO,
      entidadId: usuario.id,
      accion: ACCION_AUDITORIA.CREAR,
      valorNuevo: {
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol.clave,
      },
    });
    revalidatePath("/usuarios");
    return { ok: true };
  } catch (error) {
    logger.error("Error al crear usuario", error);
    return { error: "No se pudo crear el usuario." };
  }
}

export async function editarUsuario(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await requirePermiso(PERMISOS.USUARIOS_EDITAR);
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Usuario inválido." };

  const parsed = editarUsuarioSchema.safeParse({
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const anterior = await usuariosService.buscarPorId(id);
    if (!anterior) return { error: "Usuario no encontrado." };
    if (await usuariosService.emailEnUso(parsed.data.email, id)) {
      return { error: "Ya existe un usuario con ese email." };
    }
    const actualizado = await usuariosService.actualizar(id, parsed.data);
    await auditoriaService.registrar({
      usuarioId: actor.id,
      entidad: ENTIDAD_AUDITORIA.USUARIO,
      entidadId: id,
      accion: ACCION_AUDITORIA.EDITAR,
      valorAnterior: {
        nombre: anterior.nombre,
        apellido: anterior.apellido,
        email: anterior.email,
      },
      valorNuevo: {
        nombre: actualizado.nombre,
        apellido: actualizado.apellido,
        email: actualizado.email,
      },
    });
    revalidatePath("/usuarios");
    return { ok: true };
  } catch (error) {
    logger.error("Error al editar usuario", error);
    return { error: "No se pudo editar el usuario." };
  }
}

export async function cambiarPasswordUsuario(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await requirePermiso(PERMISOS.USUARIOS_CAMBIAR_PASSWORD);
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Usuario inválido." };

  const parsed = cambiarPasswordSchema.safeParse({
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await usuariosService.cambiarPassword(id, parsed.data.password);
    await auditoriaService.registrar({
      usuarioId: actor.id,
      entidad: ENTIDAD_AUDITORIA.USUARIO,
      entidadId: id,
      accion: ACCION_AUDITORIA.CAMBIAR_PASSWORD,
    });
    revalidatePath("/usuarios");
    return { ok: true };
  } catch (error) {
    logger.error("Error al cambiar contraseña de usuario", error);
    return { error: "No se pudo cambiar la contraseña." };
  }
}

export async function cambiarRolUsuario(
  id: string,
  rolId: string,
): Promise<ActionResult> {
  const actor = await requirePermiso(PERMISOS.USUARIOS_CAMBIAR_ROL);

  const parsed = cambiarRolSchema.safeParse({ rolId });
  if (!parsed.success) return { error: "Rol inválido." };

  try {
    const anterior = await usuariosService.buscarPorId(id);
    if (!anterior) return { error: "Usuario no encontrado." };
    const actualizado = await usuariosService.cambiarRol(id, parsed.data.rolId);
    await auditoriaService.registrar({
      usuarioId: actor.id,
      entidad: ENTIDAD_AUDITORIA.USUARIO,
      entidadId: id,
      accion: ACCION_AUDITORIA.CAMBIAR_ROL,
      valorAnterior: { rol: anterior.rol.clave },
      valorNuevo: { rol: actualizado.rol.clave },
    });
    revalidatePath("/usuarios");
    return { ok: true };
  } catch (error) {
    logger.error("Error al cambiar rol de usuario", error);
    return { error: "No se pudo cambiar el rol." };
  }
}

export async function cambiarEstadoUsuario(
  id: string,
  activo: boolean,
): Promise<ActionResult> {
  const actor = await requirePermiso(PERMISOS.USUARIOS_ACTIVAR);

  // Un usuario no puede desactivarse a sí mismo.
  if (id === actor.id && !activo) {
    return { error: "No podés desactivar tu propia cuenta." };
  }

  try {
    await usuariosService.cambiarEstado(id, activo);
    await auditoriaService.registrar({
      usuarioId: actor.id,
      entidad: ENTIDAD_AUDITORIA.USUARIO,
      entidadId: id,
      accion: activo ? ACCION_AUDITORIA.ACTIVAR : ACCION_AUDITORIA.DESACTIVAR,
    });
    revalidatePath("/usuarios");
    return { ok: true };
  } catch (error) {
    logger.error("Error al cambiar estado de usuario", error);
    return { error: "No se pudo actualizar el estado." };
  }
}
