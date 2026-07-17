import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { UsersManager, type UserRow } from "@/components/users/UsersManager";
import { requireRole } from "@/lib/auth";
import { listUsers } from "@/services/userService";

export const metadata: Metadata = { title: "Usuarios" };
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requireRole(["ADMIN"]);
  const users = await listUsers();

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Usuarios"
        description="Gestioná los empleados y administradores del sistema."
      />
      <UsersManager users={users as UserRow[]} />
    </div>
  );
}
