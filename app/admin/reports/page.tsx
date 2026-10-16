import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { ReportsManager } from "@/components/admin/ReportsManager";

export const instant = false;

export default async function AdminReportsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return <ReportsManager />;
}
