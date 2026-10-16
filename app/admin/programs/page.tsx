import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { ProgramsManager } from "@/components/admin/ProgramsManager";

export const instant = false;

export default async function AdminProgramsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return <ProgramsManager />;
}
