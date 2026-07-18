// ============================================================
//  Matriz de permisos por rol base
//
//  Esta matriz es la FUENTE para el seed inicial de la tabla Rol.
//  En runtime, los permisos efectivos se leen de `Rol.permisos`
//  (BD), no de acá. Modificar un rol existente se hace por BD/UI,
//  no cambiando este archivo.
// ============================================================

import { CLAVE_ROL, type ClaveRol } from "../constants/roles";
import { PERMISOS, TODOS_LOS_PERMISOS, type Permiso } from "./permisos";

export const PERMISOS_POR_ROL: Record<ClaveRol, Permiso[]> = {
  // El administrador puede hacer todo.
  [CLAVE_ROL.ADMIN]: TODOS_LOS_PERMISOS,

  // El empleado opera el inventario, pero no administra usuarios,
  // roles ni configuración crítica.
  [CLAVE_ROL.EMPLEADO]: [
    PERMISOS.PRENDAS_VER,
    PERMISOS.PRENDAS_CREAR,
    PERMISOS.PRENDAS_EDITAR,
    PERMISOS.LOTES_VER,
    PERMISOS.VENTAS_VER,
    PERMISOS.VENTAS_REGISTRAR,
  ],
};

/** Metadatos de los roles base para el seed. */
export const ROLES_BASE: {
  clave: ClaveRol;
  nombre: string;
  descripcion: string;
  permisos: Permiso[];
}[] = [
  {
    clave: CLAVE_ROL.ADMIN,
    nombre: "Administrador",
    descripcion: "Acceso total al sistema.",
    permisos: PERMISOS_POR_ROL[CLAVE_ROL.ADMIN],
  },
  {
    clave: CLAVE_ROL.EMPLEADO,
    nombre: "Empleado",
    descripcion: "Gestiona el inventario y registra ventas.",
    permisos: PERMISOS_POR_ROL[CLAVE_ROL.EMPLEADO],
  },
];
