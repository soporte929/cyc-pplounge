import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { AdminSidebar } from "./admin-sidebar";
import { StaffNav } from "@/components/staff-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServiceClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check staff role
  const { data: staffRecord } = await supabase
    .from("staff")
    .select("role, name")
    .eq("user_id", user.id)
    .single();

  if (!staffRecord || staffRecord.role !== "admin") {
    redirect("/scan");
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      <AdminSidebar staffName={staffRecord.name} />
      <main className="flex-1 overflow-y-auto p-8 pb-24 md:p-12 ml-0 lg:ml-72 lg:pb-12">
        {children}
      </main>
      <div className="lg:hidden">
        <StaffNav />
      </div>
    </div>
  );
}
