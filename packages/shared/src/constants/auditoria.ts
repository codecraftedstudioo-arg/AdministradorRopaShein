// Constantes de auditoría compartidas: entidades y acciones registrables.
// Los campos `entidad` y `accion` de Auditoria son String (extensibles);
// estas constantes mantienen consistencia entre módulos.

export const ENTIDAD_AUDITORIA = {
  USUARIO: "Usuario",
  ROL: "Rol",
  SESION: "Sesion",
  PRENDA: "Prenda",
  VENTA: "Venta",
  LOTE: "Lote",
  PROVEEDOR: "Proveedor",
  IMPORTACION: "Importacion",
  CONFIGURACION: "Configuracion",
} as const;

export type EntidadAuditoria =
  (typeof ENTIDAD_AUDITORIA)[keyof typeof ENTIDAD_AUDITORIA];

export const ACCION_AUDITORIA = {
  LOGIN: "INICIO_SESION",
  LOGOUT: "CIERRE_SESION",
  CREAR: "CREAR",
  EDITAR: "EDITAR",
  CAMBIAR_PASSWORD: "CAMBIAR_PASSWORD",
  CAMBIAR_ROL: "CAMBIAR_ROL",
  ACTIVAR: "ACTIVAR",
  DESACTIVAR: "DESACTIVAR",
  // Inventario
  CAMBIAR_ESTADO: "CAMBIAR_ESTADO",
  ARCHIVAR: "ARCHIVAR",
  VENDER: "VENDER",
  DUPLICAR: "DUPLICAR",
  RESERVAR: "RESERVAR",
  LIBERAR: "LIBERAR",
  IMPORTAR: "IMPORTAR",
} as const;

export type AccionAuditoria =
  (typeof ACCION_AUDITORIA)[keyof typeof ACCION_AUDITORIA];

/** Etiquetas legibles de acciones (para la UI de auditoría). */
export const ACCION_AUDITORIA_LABELS: Record<string, string> = {
  INICIO_SESION: "Inicio de sesión",
  CIERRE_SESION: "Cierre de sesión",
  CREAR: "Creación",
  EDITAR: "Edición",
  CAMBIAR_PASSWORD: "Cambio de contraseña",
  CAMBIAR_ROL: "Cambio de rol",
  ACTIVAR: "Activación",
  DESACTIVAR: "Desactivación",
  CAMBIAR_ESTADO: "Cambio de estado",
  ARCHIVAR: "Archivada",
  VENDER: "Venta registrada",
  DUPLICAR: "Duplicada",
  RESERVAR: "Reservada",
  LIBERAR: "Liberada (disponible)",
  IMPORTAR: "Importación masiva",
};
