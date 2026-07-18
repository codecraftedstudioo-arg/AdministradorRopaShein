import type { Metadata } from "next";
import { usuariosService, rolesService } from "@shein/database";
import { PERMISOS } from "@shein/shared";
import { requirePermiso } from "@/auth/guards";
import { PageHeader } from "@/components/layout/PageHeader";
import { UsersManager, type UsuarioDTO, type RolDTO } from "./UsersManager";

export const metadata: Metadata = { title: "Usuarios" };

export default async function UsuariosPage() {
  const sesion = await requirePermiso(PERMISOS.USUARIOS_VER);

  const [usuarios, roles] = await Promise.all([
    usuariosService.listar(),
    rolesService.listar(),
  ]);

  const usuariosDTO: UsuarioDTO[] = usuarios.map((u) => ({
    id: u.id,
    nombre: u.nombre,
    apellido: u.apellido,
    email: u.email,
    activo: u.activo,
    ultimoLogin: u.ultimoLogin ? u.ultimoLogin.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
    rol: { id: u.rol.id, clave: u.rol.clave, nombre: u.rol.nombre },
  }));

  const rolesDTO: RolDTO[] = roles.map((r) => ({
    id: r.id,
    clave: r.clave,
    nombre: r.nombre,
  }));

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description="Gestioná las cuentas, roles y accesos del equipo."
      />
      <UsersManager
        usuarios={usuariosDTO}
        roles={rolesDTO}
        sesionId={sesion.id}
      />
    </div>
  );
}
