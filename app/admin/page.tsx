import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import AdminDashboard from "@/components/admin/AdminDashboard";

// Staff authentication depends on the request cookie, so this route is intentionally blocking.
export const instant = false;

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return <AdminDashboard />;
}
