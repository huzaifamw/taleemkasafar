import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminBottomNav } from "@/components/admin/admin-bottom-nav";
import { AdminMobileHeader } from "@/components/admin/admin-mobile-header";
import { Suspense } from "react";

/**
 * Admin layout with authentication guard.
 * Only users in the admins table with is_active=true can access.
 * Matches student dashboard design with Soft Brutalist styling.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin-auth/login");
  }

  // Check if user is an active admin
  const { data: adminData } = await supabase
    .from("admins")
    .select("id, username, is_active")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!adminData) {
    // User is authenticated but not an admin
    redirect("/");
  }

  return (
    <div className="min-h-svh bg-surface font-body text-on-surface">
      <Suspense fallback={<AdminSidebarFallback />}>
        <AdminSidebar adminUsername={adminData.username} />
      </Suspense>
      <AdminMobileHeader adminUsername={adminData.username} />
      <Suspense fallback={null}>
        <AdminBottomNav />
      </Suspense>
      <div className="pb-20 md:ml-64 md:pb-0">{children}</div>
    </div>
  );
}

function AdminSidebarFallback() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r-2 border-black bg-white md:block" />
  );
}
