import { requireSesion } from "@/auth/guards";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await requireSesion();
  return <AppShell usuario={sesion}>{children}</AppShell>;
}
