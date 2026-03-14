import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/constants/roles";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await requireRole([ROLES.ORG_ADMIN, ROLES.SUPER_ADMIN]);
  if (!data) redirect("/dashboard");

  return (
    <DashboardShell user={data.user} profile={data.profile}>
      {children}
    </DashboardShell>
  );
}
