"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminAuthState = {
  error: string | null;
};

/**
 * Server Action: Admin login with email/password.
 * Validates that the user exists in the admins table and is active.
 */
export async function adminLoginAction(
  _prev: AdminAuthState,
  formData: FormData
): Promise<AdminAuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const supabase = await createClient();

    // Authenticate with Supabase Auth.
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authError || !authData.user) {
      return { error: "Invalid email or password." };
    }

    // Check if the authenticated account is an active admin.
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("id, username, is_active")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (adminError || !adminData) {
      await supabase.auth.signOut();
      return { error: "Access denied: Admin privileges required." };
    }

    if (!adminData.is_active) {
      await supabase.auth.signOut();
      return { error: "Admin account is deactivated." };
    }

    // This is useful metadata, but a failed timestamp update must not block a
    // valid admin from signing in.
    await supabase
      .from("admins")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", adminData.id);
  } catch (error) {
    console.error("Admin login failed:", error);
    return {
      error: "The login service is temporarily unavailable. Please try again.",
    };
  }

  redirect("/admin");
}
