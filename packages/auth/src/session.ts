// Tipo de la sesión autenticada. Es lo que viaja (firmado) en el JWT y
// lo que consumen web, mobile y store. Incluye un snapshot de permisos
// para poder autorizar sin golpear la BD en cada request; los cambios de
// permisos se reflejan al renovar la sesión.

export interface SesionUsuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  /** Clave estable del rol (ej: "ADMIN"). */
  rolClave: string;
  /** Nombre legible del rol (ej: "Administrador"). */
  rolNombre: string;
  /** Snapshot de permisos del rol. */
  permisos: string[];
}
