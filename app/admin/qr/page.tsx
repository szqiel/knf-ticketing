import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { StaffQrView } from "@/components/admin/StaffQrView";

export const instant = false;

export default async function AdminQrPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return <StaffQrView />;
}
