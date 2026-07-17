import "server-only";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { logAction } from "./auditService";

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: { select: { createdProducts: true, sales: true } },
    },
  });
}

export async function createUser(
  input: { name: string; email: string; password: string; role: Role },
  actorId: string,
) {
  const password = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, password, role: input.role },
  });
  await logAction({
    actorId,
    action: "CREATE",
    entity: "USER",
    entityId: user.id,
    summary: `Creó el usuario ${user.name} (${user.email}) como ${user.role}`,
  });
  return user;
}

export async function updateUser(
  id: string,
  input: { name?: string; email?: string; password?: string; role?: Role; isActive?: boolean },
  actorId: string,
) {
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.email !== undefined) data.email = input.email;
  if (input.role !== undefined) data.role = input.role;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.password) data.password = await hashPassword(input.password);

  const user = await prisma.user.update({ where: { id }, data });
  await logAction({
    actorId,
    action: "UPDATE",
    entity: "USER",
    entityId: user.id,
    summary: `Modificó el usuario ${user.name} (${user.email})`,
  });
  return user;
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}
