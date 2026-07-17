"use server";

import { prisma } from "@/lib/prisma";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";
import { logAction } from "@/services/auditService";
import { loginSchema } from "@/lib/validations";
import { getSession } from "@/lib/auth/session";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Datos inválidos. Verificá el email y la contraseña." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase().trim() },
  });

  if (!user || !user.isActive) {
    return { error: "Credenciales incorrectas o usuario inactivo." };
  }

  const valid = await verifyPassword(parsed.data.password, user.password);
  if (!valid) {
    return { error: "Credenciales incorrectas." };
  }

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  await logAction({
    actorId: user.id,
    action: "LOGIN",
    entity: "SESSION",
    entityId: user.id,
    summary: `${user.name} inició sesión`,
  });

  return {};
}

export async function logoutAction() {
  const session = await getSession();
  if (session) {
    await logAction({
      actorId: session.id,
      action: "LOGOUT",
      entity: "SESSION",
      entityId: session.id,
      summary: `${session.name} cerró sesión`,
    });
  }
  await destroySession();
}
