// Re-export centralizado de permisos para la app.
// El catálogo y la lógica viven en @shein/shared (compartidos).
export {
  PERMISOS,
  PERMISO_LABELS,
  tienePermiso,
  tieneAlgunPermiso,
  tieneTodosLosPermisos,
  esAdmin,
  type Permiso,
} from "@shein/shared";
