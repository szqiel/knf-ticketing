import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { AudienceManager } from "@/components/admin/AudienceManager";

export const instant = false;

export default async function AdminAudiencePage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return <AudienceManager />;
}
