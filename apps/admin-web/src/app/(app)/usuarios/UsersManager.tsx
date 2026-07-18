"use client";

import * as React from "react";
import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Pencil,
  KeyRound,
  UserCheck,
  UserX,
  ShieldCheck,
} from "lucide-react";
import {
  Button,
  Input,
  Label,
  Select,
  Badge,
  Avatar,
  Modal,
  ConfirmDialog,
  EmptyState,
} from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISOS } from "@shein/shared";
import { formatDate } from "@/lib/utils";
import {
  crearUsuario,
  editarUsuario,
  cambiarPasswordUsuario,
  cambiarRolUsuario,
  cambiarEstadoUsuario,
  type ActionResult,
} from "./actions";

export interface RolDTO {
  id: string;
  clave: string;
  nombre: string;
}

export interface UsuarioDTO {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
  ultimoLogin: string | null;
  createdAt: string;
  rol: RolDTO;
}

export function UsersManager({
  usuarios,
  roles,
  sesionId,
}: {
  usuarios: UsuarioDTO[];
  roles: RolDTO[];
  sesionId: string;
}) {
  const { can } = usePermissions();
  const [query, setQuery] = React.useState("");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editando, setEditando] = React.useState<UsuarioDTO | null>(null);
  const [passwordDe, setPasswordDe] = React.useState<UsuarioDTO | null>(null);

  const filtrados = usuarios.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      `${u.nombre} ${u.apellido}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const abrirCrear = () => {
    setEditando(null);
    setFormOpen(true);
  };
  const abrirEditar = (u: UsuarioDTO) => {
    setEditando(u);
    setFormOpen(true);
  };

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Buscar por nombre o email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {can(PERMISOS.USUARIOS_CREAR) && (
          <Button onClick={abrirCrear}>
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </Button>
        )}
      </div>

      <div className="card-surface overflow-hidden">
        {filtrados.length === 0 ? (
          <div className="p-10">
            <EmptyState
              title="Sin usuarios"
              description="No hay usuarios que coincidan con la búsqueda."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs text-muted">
                  <th className="px-5 py-3 font-medium">Usuario</th>
                  <th className="px-5 py-3 font-medium">Rol</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Último ingreso</th>
                  <th className="px-5 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((u) => (
                  <UsuarioRow
                    key={u.id}
                    usuario={u}
                    roles={roles}
                    esSesionActual={u.id === sesionId}
                    onEditar={() => abrirEditar(u)}
                    onPassword={() => setPasswordDe(u)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UsuarioFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        roles={roles}
        usuario={editando}
        key={editando?.id ?? "nuevo"}
      />

      <PasswordModal
        open={passwordDe !== null}
        onClose={() => setPasswordDe(null)}
        usuario={passwordDe}
        key={passwordDe?.id ?? "sin-usuario"}
      />
    </div>
  );
}

// ------------------------------------------------------------
//  Fila de usuario
// ------------------------------------------------------------

function UsuarioRow({
  usuario,
  roles,
  esSesionActual,
  onEditar,
  onPassword,
}: {
  usuario: UsuarioDTO;
  roles: RolDTO[];
  esSesionActual: boolean;
  onEditar: () => void;
  onPassword: () => void;
}) {
  const { can } = usePermissions();
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmar, setConfirmar] = React.useState(false);

  const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`;

  const cambiarRol = (rolId: string) => {
    if (rolId === usuario.rol.id) return;
    startTransition(async () => {
      const res = await cambiarRolUsuario(usuario.id, rolId);
      notificar(res, "Rol actualizado");
    });
  };

  const toggleEstado = () => {
    startTransition(async () => {
      const res = await cambiarEstadoUsuario(usuario.id, !usuario.activo);
      notificar(res, usuario.activo ? "Usuario desactivado" : "Usuario activado");
      setConfirmar(false);
    });
  };

  const notificar = (res: ActionResult, exito: string) => {
    if (res.ok) {
      toast(exito, "success");
      router.refresh();
    } else {
      toast(res.error ?? "Ocurrió un error", "error");
    }
  };

  return (
    <tr className="border-b border-[var(--border)] last:border-0 hover:bg-surface-2/50">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={nombreCompleto} size="sm" />
          <div>
            <p className="font-medium text-foreground">{nombreCompleto}</p>
            <p className="text-xs text-muted">{usuario.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3">
        {can(PERMISOS.USUARIOS_CAMBIAR_ROL) ? (
          <Select
            value={usuario.rol.id}
            onChange={(e) => cambiarRol(e.target.value)}
            disabled={pending}
            className="h-8 w-40 text-xs"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </Select>
        ) : (
          <Badge className="bg-surface-2 text-foreground ring-[var(--border)]">
            <ShieldCheck className="h-3 w-3" />
            {usuario.rol.nombre}
          </Badge>
        )}
      </td>
      <td className="px-5 py-3">
        {usuario.activo ? (
          <Badge className="bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400">
            Activo
          </Badge>
        ) : (
          <Badge className="bg-red-500/10 text-red-600 ring-red-500/20 dark:text-red-400">
            Inactivo
          </Badge>
        )}
      </td>
      <td className="px-5 py-3 text-muted">
        {usuario.ultimoLogin ? formatDate(usuario.ultimoLogin, true) : "—"}
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center justify-end gap-1">
          {can(PERMISOS.USUARIOS_EDITAR) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onEditar}
              aria-label="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {can(PERMISOS.USUARIOS_CAMBIAR_PASSWORD) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onPassword}
              aria-label="Cambiar contraseña"
            >
              <KeyRound className="h-4 w-4" />
            </Button>
          )}
          {can(PERMISOS.USUARIOS_ACTIVAR) && !esSesionActual && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setConfirmar(true)}
              aria-label={usuario.activo ? "Desactivar" : "Activar"}
            >
              {usuario.activo ? (
                <UserX className="h-4 w-4 text-red-500" />
              ) : (
                <UserCheck className="h-4 w-4 text-emerald-500" />
              )}
            </Button>
          )}
        </div>

        <ConfirmDialog
          open={confirmar}
          onClose={() => setConfirmar(false)}
          onConfirm={toggleEstado}
          title={usuario.activo ? "Desactivar usuario" : "Activar usuario"}
          description={
            usuario.activo
              ? `${nombreCompleto} no podrá iniciar sesión hasta ser reactivado.`
              : `${nombreCompleto} podrá volver a iniciar sesión.`
          }
          confirmLabel={usuario.activo ? "Desactivar" : "Activar"}
          variant={usuario.activo ? "danger" : "primary"}
        />
      </td>
    </tr>
  );
}

// ------------------------------------------------------------
//  Modal crear / editar
// ------------------------------------------------------------

function UsuarioFormModal({
  open,
  onClose,
  roles,
  usuario,
}: {
  open: boolean;
  onClose: () => void;
  roles: RolDTO[];
  usuario: UsuarioDTO | null;
}) {
  const esEdicion = usuario !== null;
  const { toast } = useToast();
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    esEdicion ? editarUsuario : crearUsuario,
    {},
  );

  React.useEffect(() => {
    if (state.ok) {
      toast(esEdicion ? "Usuario actualizado" : "Usuario creado", "success");
      router.refresh();
      onClose();
    }
  }, [state, esEdicion, toast, router, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={esEdicion ? "Editar usuario" : "Nuevo usuario"}
      description={
        esEdicion
          ? "Actualizá los datos del usuario."
          : "Completá los datos para crear un usuario."
      }
    >
      <form action={formAction} className="flex flex-col gap-4">
        {esEdicion && <input type="hidden" name="id" value={usuario.id} />}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nombre" required>
              Nombre
            </Label>
            <Input
              id="nombre"
              name="nombre"
              defaultValue={usuario?.nombre}
              required
            />
          </div>
          <div>
            <Label htmlFor="apellido" required>
              Apellido
            </Label>
            <Input
              id="apellido"
              name="apellido"
              defaultValue={usuario?.apellido}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={usuario?.email}
            required
          />
        </div>

        {!esEdicion && (
          <>
            <div>
              <Label htmlFor="password" required>
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                required
              />
            </div>
            <div>
              <Label htmlFor="rolId" required>
                Rol
              </Label>
              <Select id="rolId" name="rolId" defaultValue="" required>
                <option value="" disabled>
                  Seleccioná un rol
                </option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </Select>
            </div>
          </>
        )}

        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={pending}>
            {esEdicion ? "Guardar cambios" : "Crear usuario"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ------------------------------------------------------------
//  Modal cambiar contraseña
// ------------------------------------------------------------

function PasswordModal({
  open,
  onClose,
  usuario,
}: {
  open: boolean;
  onClose: () => void;
  usuario: UsuarioDTO | null;
}) {
  const { toast } = useToast();
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    cambiarPasswordUsuario,
    {},
  );

  React.useEffect(() => {
    if (state.ok) {
      toast("Contraseña actualizada", "success");
      onClose();
    }
  }, [state, toast, onClose]);

  if (!usuario) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cambiar contraseña"
      description={`Nueva contraseña para ${usuario.nombre} ${usuario.apellido}.`}
    >
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={usuario.id} />
        <div>
          <Label htmlFor="password" required>
            Nueva contraseña
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            required
          />
        </div>

        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={pending}>
            Actualizar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
