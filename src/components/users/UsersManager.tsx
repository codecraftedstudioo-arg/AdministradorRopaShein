"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, ShieldCheck, User as UserIcon } from "lucide-react";
import type { Role } from "@prisma/client";
import {
  Card,
  Button,
  Modal,
  Input,
  Select,
  Label,
  FieldError,
  Avatar,
  Badge,
  useToast,
} from "@/components/ui";
import { userSchema, type UserFormValues } from "@/lib/validations";
import { createUserAction, updateUserAction } from "@/app/(dashboard)/users/actions";
import { ROLE_LABELS } from "@/utils/constants";
import { formatDate } from "@/lib/utils";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  _count: { createdProducts: number; sales: number };
}

export function UsersManager({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<UserRow | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", password: "", role: "EMPLOYEE", isActive: true },
  });

  const openNew = () => {
    setEditing(null);
    reset({ name: "", email: "", password: "", role: "EMPLOYEE", isActive: true });
    setModalOpen(true);
  };

  const openEdit = (u: UserRow) => {
    setEditing(u);
    reset({ name: u.name, email: u.email, password: "", role: u.role, isActive: u.isActive });
    setModalOpen(true);
  };

  const onSubmit = async (values: UserFormValues) => {
    const res = editing
      ? await updateUserAction(editing.id, {
          name: values.name,
          email: values.email,
          role: values.role,
          isActive: values.isActive,
          password: values.password || undefined,
        })
      : await createUserAction({
          name: values.name,
          email: values.email,
          password: values.password ?? "",
          role: values.role,
        });

    if (res.ok) {
      toast(editing ? "Usuario actualizado" : "Usuario creado", "success");
      setModalOpen(false);
      router.refresh();
    } else {
      toast(res.error ?? "Error", "error");
    }
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Nuevo usuario
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs font-medium text-muted">
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Prendas</th>
                <th className="px-4 py-3">Ventas</th>
                <th className="px-4 py-3">Alta</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-2">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size="sm" />
                      <div>
                        <p className="font-medium text-foreground">{u.name}</p>
                        <p className="text-xs text-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className="bg-surface-2 text-foreground ring-[var(--border)]">
                      {u.role === "ADMIN" ? (
                        <ShieldCheck className="h-3 w-3" />
                      ) : (
                        <UserIcon className="h-3 w-3" />
                      )}
                      {ROLE_LABELS[u.role]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {u.isActive ? (
                      <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                        Activo
                      </Badge>
                    ) : (
                      <Badge className="bg-neutral-100 text-neutral-600 ring-neutral-500/20 dark:bg-neutral-500/10 dark:text-neutral-400">
                        Inactivo
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted">
                    {u._count.createdProducts}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted">
                    {u._count.sales}
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(u)}>
                      <Pencil className="h-4 w-4" /> Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar usuario" : "Nuevo usuario"}
        description={
          editing
            ? "Actualizá los datos. Dejá la contraseña vacía para no cambiarla."
            : "Creá un nuevo empleado o administrador."
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label required>Nombre</Label>
            <Input {...register("name")} error={!!errors.name} />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <Label required>Email</Label>
            <Input type="email" {...register("email")} error={!!errors.email} />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <Label required={!editing}>
              {editing ? "Nueva contraseña (opcional)" : "Contraseña"}
            </Label>
            <Input type="password" {...register("password")} error={!!errors.password} />
            <FieldError message={errors.password?.message} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Rol</Label>
              <Select {...register("role")}>
                <option value="EMPLOYEE">Empleado</option>
                <option value="ADMIN">Administrador</option>
              </Select>
            </div>
            {editing && (
              <div>
                <Label>Estado</Label>
                <label className="flex h-10 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    {...register("isActive")}
                    className="h-4 w-4 rounded border-[var(--border-strong)]"
                  />
                  Activo
                </label>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {editing ? "Guardar" : "Crear usuario"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
