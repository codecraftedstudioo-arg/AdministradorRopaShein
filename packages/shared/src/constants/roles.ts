// Claves estables de los roles base. Se usan como `Rol.clave` en la BD.
// El sistema permite crear más roles en runtime (la clave es libre).

export const CLAVE_ROL = {
  ADMIN: "ADMIN",
  EMPLEADO: "EMPLEADO",
} as const;

export type ClaveRol = (typeof CLAVE_ROL)[keyof typeof CLAVE_ROL];
