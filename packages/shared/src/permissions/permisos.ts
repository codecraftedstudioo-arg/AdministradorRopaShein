// ============================================================
//  Catálogo central de permisos
//
//  Fuente única de verdad de las acciones controlables del
//  sistema. Los permisos NO se hardcodean por rol: cada Rol
//  almacena su lista en `Rol.permisos` (BD). Este catálogo solo
//  define qué permisos existen y agrupa por dominio, de modo que
//  agregar módulos futuros (prendas, ventas, ...) sea trivial.
// ============================================================

export const PERMISOS = {
  // Usuarios
  USUARIOS_VER: "usuarios.ver",
  USUARIOS_CREAR: "usuarios.crear",
  USUARIOS_EDITAR: "usuarios.editar",
  USUARIOS_ACTIVAR: "usuarios.activar",
  USUARIOS_CAMBIAR_PASSWORD: "usuarios.cambiar_password",
  USUARIOS_CAMBIAR_ROL: "usuarios.cambiar_rol",

  // Roles y permisos
  ROLES_ADMINISTRAR: "roles.administrar",

  // Auditoría
  AUDITORIA_VER: "auditoria.ver",

  // Configuración global
  CONFIGURACION_EDITAR: "configuracion.editar",

  // Inventario (prendas)
  PRENDAS_VER: "prendas.ver",
  PRENDAS_CREAR: "prendas.crear",
  PRENDAS_EDITAR: "prendas.editar",
  PRENDAS_ARCHIVAR: "prendas.archivar",
  PRENDAS_IMPORTAR: "prendas.importar",

  // Lotes y proveedores
  LOTES_VER: "lotes.ver",
  LOTES_ADMINISTRAR: "lotes.administrar",
  PROVEEDORES_ADMINISTRAR: "proveedores.administrar",

  // Ventas
  VENTAS_VER: "ventas.ver",
  VENTAS_REGISTRAR: "ventas.registrar",
} as const;

export type Permiso = (typeof PERMISOS)[keyof typeof PERMISOS];

/** Lista completa de permisos disponibles. */
export const TODOS_LOS_PERMISOS: Permiso[] = Object.values(PERMISOS);

/** Metadatos legibles por permiso (para la futura UI de roles). */
export const PERMISO_LABELS: Record<Permiso, string> = {
  "usuarios.ver": "Ver usuarios",
  "usuarios.crear": "Crear usuarios",
  "usuarios.editar": "Editar usuarios",
  "usuarios.activar": "Activar / desactivar usuarios",
  "usuarios.cambiar_password": "Cambiar contraseña de usuarios",
  "usuarios.cambiar_rol": "Cambiar rol de usuarios",
  "roles.administrar": "Administrar roles y permisos",
  "auditoria.ver": "Ver auditoría",
  "configuracion.editar": "Editar configuración global",
  "prendas.ver": "Ver inventario",
  "prendas.crear": "Crear prendas",
  "prendas.editar": "Editar prendas",
  "prendas.archivar": "Archivar prendas",
  "prendas.importar": "Importar prendas masivamente",
  "lotes.ver": "Ver lotes",
  "lotes.administrar": "Administrar lotes",
  "proveedores.administrar": "Administrar proveedores",
  "ventas.ver": "Ver ventas",
  "ventas.registrar": "Registrar ventas",
};
