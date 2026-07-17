"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createUser, updateUser } from "@/services/userService";
import { userSchema } from "@/lib/validations";
import type { Role } from "@prisma/client";

export interface UserActionResult {
  ok: boolean;
  error?: string;
}

export async function createUserAction(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
}): Promise<UserActionResult> {
  const actor = await requireRole(["ADMIN"]);
  const parsed = userSchema.safeParse(input);
  if (!parsed.success || !input.password) {
    return { ok: false, error: "Datos inválidos. La contraseña es obligatoria." };
  }
  try {
    await createUser(
      {
        name: input.name,
        email: input.email.toLowerCase().trim(),
        password: input.password,
        role: input.role,
      },
      actor.id,
    );
    revalidatePath("/users");
    return { ok: true };
  } catch (e) {
    const msg =
      e instanceof Error && e.message.includes("Unique")
        ? "Ya existe un usuario con ese email."
        : "No se pudo crear el usuario.";
    return { ok: false, error: msg };
  }
}

export async function updateUserAction(
  id: string,
  input: {
    name?: string;
    email?: string;
    password?: string;
    role?: Role;
    isActive?: boolean;
  },
): Promise<UserActionResult> {
  const actor = await requireRole(["ADMIN"]);
  try {
    await updateUser(
      id,
      {
        ...input,
        email: input.email?.toLowerCase().trim(),
        password: input.password || undefined,
      },
      actor.id,
    );
    revalidatePath("/users");
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo actualizar el usuario." };
  }
}
